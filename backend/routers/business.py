import io
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from pymongo import ReturnDocument
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from clerk_auth import require_user
from lib.dates import today_iso
from lib.db import db
from models.business import (
    Client,
    ClientInput,
    ClientUpdate,
    FollowUp,
    FollowUpInput,
    FollowUpUpdate,
    Invoice,
    InvoiceInput,
    Payment,
    PaymentInput,
    Workspace,
    WorkspaceSummary,
)

router = APIRouter()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def money(value: float) -> float:
    return round(float(value) + 1e-9, 2)


def display_status(doc: dict, paid: float) -> str:
    total = float(doc["total"])
    if paid >= total - 0.005:
        return "paid"
    if doc.get("workflow_status") == "draft":
        return "draft"
    today = datetime.strptime(today_iso(), "%Y-%m-%d").date()
    due = datetime.strptime(doc["due_date"], "%Y-%m-%d").date()
    if due < today:
        return "overdue"
    if due <= today + timedelta(days=7):
        return "due_soon"
    return "pending"


async def payment_totals(owner_id: str) -> dict[str, float]:
    pipeline = [
        {"$match": {"owner_id": owner_id}},
        {"$group": {"_id": "$invoice_id", "total": {"$sum": "$amount"}}},
    ]
    return {item["_id"]: float(item["total"]) async for item in db.payments.aggregate(pipeline)}


async def invoice_model(doc: dict, paid_by_invoice: dict[str, float] | None = None) -> Invoice:
    paid = (paid_by_invoice or {}).get(doc["id"])
    if paid is None:
        result = await db.payments.aggregate([
            {"$match": {"owner_id": doc["owner_id"], "invoice_id": doc["id"]}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]).to_list(1)
        paid = float(result[0]["total"]) if result else 0
    return Invoice(
        **{key: value for key, value in doc.items() if key not in {"_id", "owner_id", "workflow_status"}},
        amount_paid=money(paid),
        balance=money(max(float(doc["total"]) - paid, 0)),
        status=display_status(doc, paid),
    )


async def client_model(doc: dict, invoices: list[Invoice] | None = None) -> Client:
    if invoices is None:
        docs = await db.invoices.find({"owner_id": doc["owner_id"], "client_id": doc["id"]}, {"_id": 0}).to_list(1000)
        totals = await payment_totals(doc["owner_id"])
        invoices = [await invoice_model(item, totals) for item in docs]
    return Client(
        **{key: value for key, value in doc.items() if key not in {"_id", "owner_id"}},
        balance=money(sum(item.balance for item in invoices)),
        invoice_count=len(invoices),
    )


@router.get("/workspace", response_model=Workspace)
async def get_workspace(user: dict = Depends(require_user)):
    owner_id = user["user_id"]
    client_docs = await db.clients.find({"owner_id": owner_id}, {"_id": 0}).sort("business_name", 1).to_list(1000)
    invoice_docs = await db.invoices.find({"owner_id": owner_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    payments = [Payment(**doc) for doc in await db.payments.find({"owner_id": owner_id}, {"_id": 0, "owner_id": 0}).sort("created_at", -1).to_list(1000)]
    follow_ups = [FollowUp(**doc) for doc in await db.follow_ups.find({"owner_id": owner_id}, {"_id": 0, "owner_id": 0}).sort("created_at", -1).to_list(1000)]
    totals = {payment.invoice_id: 0.0 for payment in payments}
    for payment in payments:
        totals[payment.invoice_id] = totals.get(payment.invoice_id, 0) + payment.amount
    invoices = [await invoice_model(doc, totals) for doc in invoice_docs]
    by_client: dict[str, list[Invoice]] = {}
    for invoice in invoices:
        by_client.setdefault(invoice.client_id, []).append(invoice)
    clients = [await client_model(doc, by_client.get(doc["id"], [])) for doc in client_docs]
    summary = WorkspaceSummary(
        client_count=sum(1 for client in clients if not client.archived),
        invoice_count=len(invoices),
        total_invoiced=money(sum(invoice.total for invoice in invoices)),
        total_outstanding=money(sum(invoice.balance for invoice in invoices)),
        total_overdue=money(sum(invoice.balance for invoice in invoices if invoice.status == "overdue")),
        total_paid=money(sum(payment.amount for payment in payments)),
    )
    return Workspace(today=today_iso(), clients=clients, invoices=invoices, payments=payments, follow_ups=follow_ups, summary=summary)


@router.post("/clients", response_model=Client, status_code=201)
async def create_client(input: ClientInput, user: dict = Depends(require_user)):
    now = utc_now()
    doc = {"id": str(uuid.uuid4()), "owner_id": user["user_id"], **input.model_dump(), "archived": False, "created_at": now, "updated_at": now}
    await db.clients.insert_one(doc)
    return await client_model(doc, [])


@router.patch("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, input: ClientUpdate, user: dict = Depends(require_user)):
    doc = await db.clients.find_one_and_update(
        {"id": client_id, "owner_id": user["user_id"]},
        {"$set": {**input.model_dump(), "updated_at": utc_now()}},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Client not found")
    return await client_model(doc)


@router.post("/invoices", response_model=Invoice, status_code=201)
async def create_invoice(input: InvoiceInput, user: dict = Depends(require_user)):
    owner_id = user["user_id"]
    client = await db.clients.find_one({"id": input.client_id, "owner_id": owner_id, "archived": False})
    if not client:
        raise HTTPException(status_code=404, detail="Active client not found")
    year = input.invoice_date[:4]
    counter = await db.counters.find_one_and_update(
        {"owner_id": owner_id, "name": f"invoice:{year}"},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    subtotal = money(input.subtotal)
    tax = money(subtotal * input.gst_rate / 100)
    now = utc_now()
    doc = {
        "id": str(uuid.uuid4()),
        "owner_id": owner_id,
        "invoice_number": f"CF-{year}-{counter['value']:04d}",
        "client_name": client["business_name"],
        **input.model_dump(exclude={"status"}),
        "workflow_status": input.status,
        "tax": tax,
        "total": money(subtotal + tax),
        "created_at": now,
        "updated_at": now,
    }
    await db.invoices.insert_one(doc)
    return await invoice_model(doc, {})


@router.patch("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, input: InvoiceInput, user: dict = Depends(require_user)):
    owner_id = user["user_id"]
    current = await db.invoices.find_one({"id": invoice_id, "owner_id": owner_id})
    if not current:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if current.get("workflow_status") != "draft":
        raise HTTPException(status_code=409, detail="Only draft invoices can be edited")
    client = await db.clients.find_one({"id": input.client_id, "owner_id": owner_id, "archived": False})
    if not client:
        raise HTTPException(status_code=404, detail="Active client not found")
    subtotal = money(input.subtotal)
    tax = money(subtotal * input.gst_rate / 100)
    updates = {**input.model_dump(exclude={"status"}), "workflow_status": input.status, "client_name": client["business_name"], "tax": tax, "total": money(subtotal + tax), "updated_at": utc_now()}
    doc = await db.invoices.find_one_and_update({"id": invoice_id, "owner_id": owner_id}, {"$set": updates}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    return await invoice_model(doc)


@router.post("/invoices/{invoice_id}/payments", response_model=Payment, status_code=201)
async def record_payment(invoice_id: str, input: PaymentInput, user: dict = Depends(require_user)):
    owner_id = user["user_id"]
    invoice = await db.invoices.find_one({"id": invoice_id, "owner_id": owner_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.get("workflow_status") == "draft":
        raise HTTPException(status_code=409, detail="Move the invoice to pending before recording payment")
    model = await invoice_model(invoice)
    if input.amount > model.balance + 0.005:
        raise HTTPException(status_code=422, detail="Payment cannot exceed the invoice balance")
    doc = {"id": str(uuid.uuid4()), "owner_id": owner_id, "invoice_id": invoice_id, "invoice_number": invoice["invoice_number"], **input.model_dump(), "amount": money(input.amount), "created_at": utc_now()}
    await db.payments.insert_one(doc)
    return Payment(**{key: value for key, value in doc.items() if key != "owner_id"})


@router.post("/follow-ups", response_model=FollowUp, status_code=201)
async def create_follow_up(input: FollowUpInput, user: dict = Depends(require_user)):
    owner_id = user["user_id"]
    invoice = await db.invoices.find_one({"id": input.invoice_id, "owner_id": owner_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    now = utc_now()
    doc = {"id": str(uuid.uuid4()), "owner_id": owner_id, "client_id": invoice["client_id"], **input.model_dump(), "created_at": now, "updated_at": now}
    await db.follow_ups.insert_one(doc)
    return FollowUp(**{key: value for key, value in doc.items() if key != "owner_id"})


@router.patch("/follow-ups/{follow_up_id}", response_model=FollowUp)
async def update_follow_up(follow_up_id: str, input: FollowUpUpdate, user: dict = Depends(require_user)):
    doc = await db.follow_ups.find_one_and_update(
        {"id": follow_up_id, "owner_id": user["user_id"]},
        {"$set": {**input.model_dump(), "updated_at": utc_now()}},
        projection={"_id": 0, "owner_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return FollowUp(**doc)


@router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str, user: dict = Depends(require_user)):
    owner_id = user["user_id"]
    doc = await db.invoices.find_one({"id": invoice_id, "owner_id": owner_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice = await invoice_model(doc)
    client = await db.clients.find_one({"id": invoice.client_id, "owner_id": owner_id})
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    pdf.setTitle(invoice.invoice_number)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(48, height - 55, "collectFlow")
    pdf.setFont("Helvetica", 9)
    pdf.drawRightString(width - 48, height - 50, "INVOICE")
    pdf.drawRightString(width - 48, height - 66, invoice.invoice_number)
    pdf.line(48, height - 85, width - 48, height - 85)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(48, height - 118, "Bill to")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(48, height - 138, client["business_name"])
    if client.get("contact_name"):
        pdf.drawString(48, height - 154, client["contact_name"])
    if client.get("gstin"):
        pdf.drawString(48, height - 170, f"GSTIN: {client['gstin']}")
    pdf.drawRightString(width - 48, height - 118, f"Invoice date: {invoice.invoice_date}")
    pdf.drawRightString(width - 48, height - 136, f"Due date: {invoice.due_date}")
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(48, height - 220, "Description")
    pdf.drawRightString(width - 48, height - 220, "Amount")
    pdf.line(48, height - 228, width - 48, height - 228)
    pdf.setFont("Helvetica", 10)
    pdf.drawString(48, height - 250, invoice.description[:75])
    pdf.drawRightString(width - 48, height - 250, f"INR {invoice.subtotal:,.2f}")
    if invoice.hsn_sac:
        pdf.setFont("Helvetica", 8)
        pdf.drawString(48, height - 266, f"HSN/SAC: {invoice.hsn_sac}")
    pdf.line(330, height - 300, width - 48, height - 300)
    pdf.setFont("Helvetica", 10)
    pdf.drawString(350, height - 320, "Subtotal")
    pdf.drawRightString(width - 48, height - 320, f"INR {invoice.subtotal:,.2f}")
    pdf.drawString(350, height - 340, f"GST ({invoice.gst_rate:g}%)")
    pdf.drawRightString(width - 48, height - 340, f"INR {invoice.tax:,.2f}")
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(350, height - 368, "Total")
    pdf.drawRightString(width - 48, height - 368, f"INR {invoice.total:,.2f}")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(350, height - 390, "Paid")
    pdf.drawRightString(width - 48, height - 390, f"INR {invoice.amount_paid:,.2f}")
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(350, height - 414, "Balance")
    pdf.drawRightString(width - 48, height - 414, f"INR {invoice.balance:,.2f}")
    pdf.setFont("Helvetica", 8)
    pdf.drawString(48, 50, "Generated by collectFlow. Payment records are manual unless confirmed by a payment provider.")
    pdf.save()
    return Response(buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{invoice.invoice_number}.pdf"'})