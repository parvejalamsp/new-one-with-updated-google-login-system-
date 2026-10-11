"""Manual payment recording: balance/paid-state updates without implying money movement.

Criterion: "Manual payment recording updates balance and paid state without implying
payment processing" (acceptance_matrix #4).
"""

import time


def _unique_name(label: str) -> str:
    return f"tscheck-{label}-{int(time.time() * 1000)}"


def _make_pending_invoice(casey_client, subtotal: float = 10000, gst_rate: float = 18):
    client_resp = casey_client.post("/clients", json={"business_name": _unique_name("payclient")})
    client_id = client_resp.json()["id"]
    invoice_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": _unique_name("pay-invoice"),
            "invoice_date": "2026-02-01",
            "due_date": "2026-03-01",
            "subtotal": subtotal,
            "gst_rate": gst_rate,
            "status": "pending",
        },
    )
    assert invoice_resp.status_code == 201
    return invoice_resp.json()


def test_payment_rejected_on_draft_invoice(casey_client):
    client_resp = casey_client.post("/clients", json={"business_name": _unique_name("draftpayclient")})
    client_id = client_resp.json()["id"]
    draft_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": _unique_name("draft-invoice"),
            "invoice_date": "2026-02-01",
            "due_date": "2026-03-01",
            "subtotal": 5000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    draft = draft_resp.json()

    payment_resp = casey_client.post(
        f"/invoices/{draft['id']}/payments",
        json={"amount": 100, "paid_on": "2026-02-05", "method": "upi"},
    )
    assert payment_resp.status_code == 409, payment_resp.text


def test_payment_rejected_when_exceeding_balance(casey_client):
    invoice = _make_pending_invoice(casey_client, subtotal=10000, gst_rate=18)
    balance = invoice["balance"]

    overpay_resp = casey_client.post(
        f"/invoices/{invoice['id']}/payments",
        json={"amount": balance + 500, "paid_on": "2026-02-05", "method": "bank_transfer"},
    )
    assert overpay_resp.status_code == 422, overpay_resp.text


def test_partial_then_full_payment_updates_balance_and_status(casey_client):
    invoice = _make_pending_invoice(casey_client, subtotal=10000, gst_rate=18)
    invoice_id = invoice["id"]
    balance = invoice["balance"]
    partial = round(balance / 2, 2)

    partial_resp = casey_client.post(
        f"/invoices/{invoice_id}/payments",
        json={"amount": partial, "paid_on": "2026-02-05", "method": "upi", "reference": "tscheck-ref"},
    )
    assert partial_resp.status_code == 201, partial_resp.text
    payment = partial_resp.json()
    assert payment["amount"] == partial
    # Manual payment record must not claim money movement by collectFlow itself.
    assert "invoice_number" in payment

    workspace = casey_client.get("/workspace").json()
    updated = next(i for i in workspace["invoices"] if i["id"] == invoice_id)
    assert round(updated["balance"], 2) == round(balance - partial, 2)
    assert updated["status"] != "paid"

    # Pay the remainder in full.
    remainder = updated["balance"]
    full_resp = casey_client.post(
        f"/invoices/{invoice_id}/payments",
        json={"amount": remainder, "paid_on": "2026-02-10", "method": "cash"},
    )
    assert full_resp.status_code == 201, full_resp.text

    workspace_after = casey_client.get("/workspace").json()
    final = next(i for i in workspace_after["invoices"] if i["id"] == invoice_id)
    assert final["balance"] == 0
    assert final["status"] == "paid"
