"""Invoice workflow: validation, unique per-agency numbering, draft edits, derived status.

Criterion: "Persistent invoice workflow validates input, creates unique per-agency
numbers, edits drafts, derives draft/pending/due-soon/overdue/paid status, and keeps
filters/counts consistent" (acceptance_matrix #3).
"""

import re
import time
from datetime import datetime, timedelta, timezone


def _unique_name(label: str) -> str:
    return f"tscheck-{label}-{int(time.time() * 1000)}"


def _make_client(casey_client) -> str:
    resp = casey_client.post("/clients", json={"business_name": _unique_name("invclient")})
    assert resp.status_code == 201
    return resp.json()["id"]


def test_invoice_validation_rejects_bad_date_and_amount(casey_client):
    client_id = _make_client(casey_client)

    # Due date before invoice date must be rejected.
    bad_date = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": "Bad date invoice",
            "invoice_date": "2026-06-10",
            "due_date": "2026-06-01",
            "subtotal": 1000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    assert bad_date.status_code == 422, bad_date.text

    # Zero/negative amount must be rejected.
    bad_amount = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": "Bad amount invoice",
            "invoice_date": "2026-06-10",
            "due_date": "2026-06-20",
            "subtotal": 0,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    assert bad_amount.status_code == 422, bad_amount.text

    # Missing required description must be rejected.
    bad_desc = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": "",
            "invoice_date": "2026-06-10",
            "due_date": "2026-06-20",
            "subtotal": 1000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    assert bad_desc.status_code == 422, bad_desc.text


def test_invoice_numbering_draft_edit_and_derived_status(casey_client):
    client_id = _make_client(casey_client)
    description = _unique_name("invoice")

    create_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": description,
            "invoice_date": "2026-01-01",
            "due_date": "2026-01-15",
            "subtotal": 10000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    assert create_resp.status_code == 201, create_resp.text
    invoice = create_resp.json()
    assert re.fullmatch(r"CF-\d{4}-\d{4}", invoice["invoice_number"])
    assert invoice["status"] == "draft"
    assert invoice["total"] == round(10000 * 1.18, 2)
    invoice_id = invoice["id"]

    # Edit the draft; persists.
    edit_resp = casey_client.patch(
        f"/invoices/{invoice_id}",
        json={
            "client_id": client_id,
            "description": f"{description}-edited",
            "invoice_date": "2026-01-01",
            "due_date": "2026-01-15",
            "subtotal": 12000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    assert edit_resp.status_code == 200, edit_resp.text
    assert edit_resp.json()["description"] == f"{description}-edited"
    assert edit_resp.json()["subtotal"] == 12000

    # Move to pending with a due date in the past -> server derives "overdue" from backend clock.
    today = datetime.now(timezone.utc).date()
    past_due = (today - timedelta(days=5)).isoformat()
    invoice_date = (today - timedelta(days=20)).isoformat()
    to_pending = casey_client.patch(
        f"/invoices/{invoice_id}",
        json={
            "client_id": client_id,
            "description": f"{description}-edited",
            "invoice_date": invoice_date,
            "due_date": past_due,
            "subtotal": 12000,
            "gst_rate": 18,
            "status": "pending",
        },
    )
    assert to_pending.status_code == 200, to_pending.text
    assert to_pending.json()["status"] == "overdue"

    # Once no longer draft, edits must be rejected (409).
    blocked_edit = casey_client.patch(
        f"/invoices/{invoice_id}",
        json={
            "client_id": client_id,
            "description": "should not apply",
            "invoice_date": invoice_date,
            "due_date": past_due,
            "subtotal": 12000,
            "gst_rate": 18,
            "status": "pending",
        },
    )
    assert blocked_edit.status_code == 409, blocked_edit.text

    # Workspace counts/filters agree: this invoice appears exactly once and is counted overdue.
    workspace = casey_client.get("/workspace").json()
    matches = [i for i in workspace["invoices"] if i["id"] == invoice_id]
    assert len(matches) == 1
    assert matches[0]["status"] == "overdue"
    assert matches[0]["balance"] > 0
