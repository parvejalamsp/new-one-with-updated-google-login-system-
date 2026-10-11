"""Client workflow: create, edit, archive/restore with optional GSTIN/contact fields.

Criterion: "Persistent client workflow supports create, view, edit, search, archive
and restore with optional GSTIN/contact fields" (acceptance_matrix #2).
"""

import time


def _unique_name() -> str:
    return f"tscheck-client-api-{int(time.time() * 1000)}"


def test_client_create_edit_archive_restore(casey_client):
    name = _unique_name()

    # Create with optional GSTIN/contact fields populated.
    create_resp = casey_client.post(
        "/clients",
        json={
            "business_name": name,
            "gstin": "29AAAAA0000A1Z5",
            "contact_name": "Jordan Contact",
            "email": "jordan@example.com",
            "phone": "9999999999",
            "address": "1 Test Street",
            "state": "Karnataka",
        },
    )
    assert create_resp.status_code == 201, create_resp.text
    client = create_resp.json()
    assert client["business_name"] == name
    assert client["gstin"] == "29AAAAA0000A1Z5"
    assert client["archived"] is False
    client_id = client["id"]

    # Edit persists.
    edit_resp = casey_client.patch(
        f"/clients/{client_id}",
        json={
            "business_name": name,
            "gstin": "29AAAAA0000A1Z5",
            "contact_name": "Jordan Updated",
            "email": "jordan@example.com",
            "phone": "9999999999",
            "address": "1 Test Street",
            "state": "Karnataka",
            "archived": False,
        },
    )
    assert edit_resp.status_code == 200, edit_resp.text
    assert edit_resp.json()["contact_name"] == "Jordan Updated"

    # View via workspace: edited record is present with the update applied.
    workspace = casey_client.get("/workspace").json()
    found = next(c for c in workspace["clients"] if c["id"] == client_id)
    assert found["contact_name"] == "Jordan Updated"
    assert found["archived"] is False

    # Archive changes this record's state without deleting it (checked on the
    # row this test created, not a global count — the account has concurrent fixtures).
    archive_resp = casey_client.patch(
        f"/clients/{client_id}",
        json={
            "business_name": name,
            "gstin": "29AAAAA0000A1Z5",
            "contact_name": "Jordan Updated",
            "email": "jordan@example.com",
            "phone": "9999999999",
            "address": "1 Test Street",
            "state": "Karnataka",
            "archived": True,
        },
    )
    assert archive_resp.status_code == 200
    assert archive_resp.json()["archived"] is True

    workspace_after_archive = casey_client.get("/workspace").json()
    archived_record = next(c for c in workspace_after_archive["clients"] if c["id"] == client_id)
    assert archived_record["business_name"] == name  # still present, not deleted
    assert archived_record["archived"] is True

    # Restore flips it back.
    restore_resp = casey_client.patch(
        f"/clients/{client_id}",
        json={
            "business_name": name,
            "gstin": "29AAAAA0000A1Z5",
            "contact_name": "Jordan Updated",
            "email": "jordan@example.com",
            "phone": "9999999999",
            "address": "1 Test Street",
            "state": "Karnataka",
            "archived": False,
        },
    )
    assert restore_resp.status_code == 200
    assert restore_resp.json()["archived"] is False
    workspace_after_restore = casey_client.get("/workspace").json()
    restored_record = next(c for c in workspace_after_restore["clients"] if c["id"] == client_id)
    assert restored_record["archived"] is False


def test_client_invalid_gstin_rejected(casey_client):
    name = _unique_name()
    resp = casey_client.post(
        "/clients",
        json={"business_name": name, "gstin": "not-a-valid-gstin"},
    )
    assert resp.status_code == 422, resp.text
