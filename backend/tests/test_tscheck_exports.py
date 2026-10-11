"""Invoice PDF export produces real PDF bytes from authenticated persistent records.

Criterion: "Invoice PDF and report CSV exports create real local files" (acceptance_matrix #5)
— the server-side PDF generation half (CSV export is a client-side transform of the same
authenticated /workspace data and has no separate backend endpoint).
"""

import time


def _unique_name(label: str) -> str:
    return f"tscheck-{label}-{int(time.time() * 1000)}"


def test_invoice_pdf_download_is_real_pdf(casey_client):
    client_resp = casey_client.post("/clients", json={"business_name": _unique_name("pdfclient")})
    client_id = client_resp.json()["id"]
    description = _unique_name("pdf-invoice")
    invoice_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": description,
            "invoice_date": "2026-02-01",
            "due_date": "2026-03-01",
            "subtotal": 5000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    assert invoice_resp.status_code == 201
    invoice = invoice_resp.json()

    pdf_resp = casey_client.get(f"/invoices/{invoice['id']}/pdf")
    assert pdf_resp.status_code == 200, pdf_resp.text
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert invoice["invoice_number"] in pdf_resp.headers.get("content-disposition", "")
    assert pdf_resp.content[:4] == b"%PDF"
    assert len(pdf_resp.content) > 500  # a real rendered document, not a stub


def test_invoice_pdf_requires_ownership(casey_client, riley_client):
    client_resp = casey_client.post("/clients", json={"business_name": _unique_name("pdfownerclient")})
    client_id = client_resp.json()["id"]
    invoice_resp = casey_client.post(
        "/invoices",
        json={
            "client_id": client_id,
            "description": _unique_name("pdf-owner-invoice"),
            "invoice_date": "2026-02-01",
            "due_date": "2026-03-01",
            "subtotal": 5000,
            "gst_rate": 18,
            "status": "draft",
        },
    )
    invoice_id = invoice_resp.json()["id"]

    cross_owner_resp = riley_client.get(f"/invoices/{invoice_id}/pdf")
    assert cross_owner_resp.status_code == 404, cross_owner_resp.text
