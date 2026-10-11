"""Pre-scaffolded pytest fixtures for the FastAPI backend.

Tests hit the live uvicorn process managed by supervisor (not an in-process ASGI app), so
the app under test is the same one the frontend and Playwright see. Do NOT re-create this
file — add app-specific fixtures below the marker at the bottom.
"""

import os
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
API_URL = f"{BACKEND_URL}/api"


def api_url(path: str = "") -> str:
    """Absolute URL for an /api route: api_url("/status") -> http://localhost:8001/api/status."""
    return f"{API_URL}{path}"


@pytest.fixture(scope="session")
def backend_url() -> str:
    return BACKEND_URL


@pytest.fixture
def client():
    """Sync httpx client rooted at /api — the default for endpoint tests.

    Example:
        def test_status(client):
            assert client.get("/status").status_code == 200
    """
    with httpx.Client(base_url=API_URL, timeout=30.0) as c:
        yield c


@pytest_asyncio.fixture
async def aclient():
    """Async variant, for tests that also await motor/backend helpers directly."""
    async with httpx.AsyncClient(base_url=API_URL, timeout=30.0) as c:
        yield c


# --- app-specific fixtures below this line ---

CLERK_SECRET_KEY = os.environ.get("CLERK_SECRET_KEY", "")
CASEY_EMAIL = "collectflow.browser+clerk_test@example.com"
RILEY_EMAIL = "collectflow.isolation+clerk_test@example.com"


def _clerk_session_token(email: str) -> str:
    """Mint a usable session JWT for `email` via the dev Clerk Backend API
    (find user -> create session -> mint token), mirroring how an authenticated
    browser session looks to the FastAPI backend. Server-side only; no UI involved.
    """
    with httpx.Client(timeout=30.0) as c:
        users = c.get(
            "https://api.clerk.com/v1/users",
            params={"email_address": email},
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
        ).json()
        user_id = users[0]["id"]
        session = c.post(
            "https://api.clerk.com/v1/sessions",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}", "Content-Type": "application/json"},
            json={"user_id": user_id},
        ).json()
        jwt_resp = c.post(
            f"https://api.clerk.com/v1/sessions/{session['id']}/tokens",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}", "Content-Type": "application/json"},
        ).json()
        return jwt_resp["jwt"]


@pytest.fixture(scope="session")
def casey_token() -> str:
    return _clerk_session_token(CASEY_EMAIL)


@pytest.fixture(scope="session")
def riley_token() -> str:
    return _clerk_session_token(RILEY_EMAIL)


@pytest.fixture
def casey_client(casey_token):
    with httpx.Client(base_url=API_URL, timeout=30.0, headers={"Authorization": f"Bearer {casey_token}"}) as c:
        yield c


@pytest.fixture
def riley_client(riley_token):
    with httpx.Client(base_url=API_URL, timeout=30.0, headers={"Authorization": f"Bearer {riley_token}"}) as c:
        yield c
