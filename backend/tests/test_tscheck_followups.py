"""Follow-up persistence: create, edit, complete without sending external messages.

Criterion: "Persistent follow-ups and user-triggered email drafts are truthful"
(acceptance_matrix #6) — the API/persistence half of this criterion.
"""

import time


def _unique_name(label: str) -> str:
    return f"tscheck-{label}-{int(time.time() * 1000)}"


def _make_pending_invoice(casey_client):
    client_resp = casey_client.post("/clients", json={"business_name": _unique_name("followclient")})
    client_id = client_resp.json()["id"]
    invoice_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": _unique_name("follow-invoice"),
            "invoice_date": "2026-02-01",
            "due_date": "2026-03-01",
            "subtotal": 5000,
            "gst_rate": 18,
            "status": "pending",
        },
    )
    return invoice_resp.json()


def test_follow_up_create_edit_complete_persists(casey_client):
    invoice = _make_pending_invoice(casey_client)
    note = _unique_name("followup-note")

    create_resp = casey_client.post(
        "/follow-ups",
        json={"invoice_id": invoice["id"], "note": note, "due_date": "2026-02-10", "status": "planned"},
    )
    assert create_resp.status_code == 201, create_resp.text
    follow_up = create_resp.json()
    assert follow_up["note"] == note
    assert follow_up["status"] == "planned"
    follow_up_id = follow_up["id"]

    # Edit persists.
    edited_note = f"{note}-edited"
    edit_resp = casey_client.patch(
        f"/follow-ups/{follow_up_id}",
        json={"note": edited_note, "due_date": "2026-02-12", "status": "planned"},
    )
    assert edit_resp.status_code == 200, edit_resp.text
    assert edit_resp.json()["note"] == edited_note

    # Complete.
    complete_resp = casey_client.patch(
        f"/follow-ups/{follow_up_id}",
        json={"note": edited_note, "due_date": "2026-02-12", "status": "completed"},
    )
    assert complete_resp.status_code == 200, complete_resp.text
    assert complete_resp.json()["status"] == "completed"

    # Persisted in workspace fetch (simulated refresh).
    workspace = casey_client.get("/workspace").json()
    stored = next(f for f in workspace["follow_ups"] if f["id"] == follow_up_id)
    assert stored["note"] == edited_note
    assert stored["status"] == "completed"


def test_follow_up_requires_existing_invoice(casey_client):
    resp = casey_client.post(
        "/follow-ups",
        json={"invoice_id": "nonexistent-invoice-id", "note": "x", "due_date": "2026-02-10", "status": "planned"},
    )
    assert resp.status_code == 404, resp.text
