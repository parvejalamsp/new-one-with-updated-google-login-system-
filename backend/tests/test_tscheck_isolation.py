"""Agency data isolation is enforced server-side.

Criterion: "Agency data isolation is enforced server-side" (acceptance_matrix #7):
Riley cannot list, edit, pay, or export Casey-owned records; unauthorized calls
return 401 and cross-owner IDs return 404.
"""

import time


def _unique_name(label: str) -> str:
    return f"tscheck-{label}-{int(time.time() * 1000)}"


def test_no_token_returns_401(client):
    resp = client.get("/workspace")
    assert resp.status_code == 401, resp.text


def test_riley_cannot_list_caseys_records(casey_client, riley_client):
    marker = _unique_name("isolation-client")
    create_resp = casey_client.post("/clients", json={"business_name": marker})
    assert create_resp.status_code == 201

    riley_workspace = riley_client.get("/workspace").json()
    riley_names = {c["business_name"] for c in riley_workspace["clients"]}
    assert marker not in riley_names


def test_riley_cannot_edit_caseys_client(casey_client, riley_client):
    marker = _unique_name("isolation-edit-client")
    create_resp = casey_client.post("/clients", json={"business_name": marker})
    client_id = create_resp.json()["id"]

    edit_resp = riley_client.patch(
        f"/clients/{client_id}",
        json={"business_name": "hijacked", "archived": False},
    )
    assert edit_resp.status_code == 404, edit_resp.text

    # Confirm Casey's record is untouched.
    workspace = casey_client.get("/workspace").json()
    found = next(c for c in workspace["clients"] if c["id"] == client_id)
    assert found["business_name"] == marker


def test_riley_cannot_pay_caseys_invoice(casey_client, riley_client):
    client_resp = casey_client.post("/clients", json={"business_name": _unique_name("isolation-pay-client")})
    client_id = client_resp.json()["id"]
    invoice_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": _unique_name("isolation-pay-invoice"),
            "invoice_date": "2026-02-01",
            "due_date": "2026-03-01",
            "subtotal": 5000,
            "gst_rate": 18,
            "status": "pending",
        },
    )
    invoice_id = invoice_resp.json()["id"]

    riley_pay_resp = riley_client.post(
        f"/invoices/{invoice_id}/payments",
        json={"amount": 100, "paid_on": "2026-02-05", "method": "upi"},
    )
    assert riley_pay_resp.status_code == 404, riley_pay_resp.text
