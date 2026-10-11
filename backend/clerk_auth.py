"""Emergent-managed Clerk auth, inert until Clerk keys are provisioned."""

import os
from functools import lru_cache

import jwt
import requests
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from requests.adapters import HTTPAdapter
from starlette.concurrency import run_in_threadpool
from urllib3.util.retry import Retry

CLERK_FRONTEND_API = "https://frontend-api.clerk.dev"
CLERK_BACKEND_API = "https://api.clerk.com/v1"
PROXY_PATH = "/api/__clerk"

_HOP_HEADERS = {
    "host", "connection", "keep-alive", "content-length", "transfer-encoding",
    "te", "trailer", "upgrade", "proxy-authorization", "proxy-authenticate",
    "content-encoding",
}


class ClerkConfig(BaseModel):
    enabled: bool
    publishable_key: str
    proxy_url: str


clerk_router = APIRouter()
_http = requests.Session()
_retry = Retry(total=2, connect=2, read=2, status=0, backoff_factor=0.1,
               allowed_methods=frozenset({"GET", "HEAD", "OPTIONS"}))
_http.mount("https://", HTTPAdapter(pool_maxsize=40, max_retries=_retry))


def _publishable_key() -> str:
    return os.environ.get("CLERK_PUBLISHABLE_KEY", "")


def _secret_key() -> str:
    return os.environ.get("CLERK_SECRET_KEY", "")


def _is_production() -> bool:
    return _publishable_key().startswith("pk_live_")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


@clerk_router.get("/clerk/config", response_model=ClerkConfig)
def clerk_config():
    key = _publishable_key()
    return ClerkConfig(
        enabled=bool(key and _secret_key()),
        publishable_key=key,
        proxy_url=PROXY_PATH if _is_production() else "",
    )


@clerk_router.api_route("/__clerk/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def clerk_proxy(path: str, request: Request):
    if not _is_production():
        raise HTTPException(status_code=404)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_HEADERS}
    headers["Clerk-Proxy-Url"] = f"https://{host.split(',')[0].strip()}{PROXY_PATH}"
    headers["Clerk-Secret-Key"] = _secret_key()
    headers["X-Forwarded-For"] = _client_ip(request)
    headers["Accept-Encoding"] = "gzip"
    try:
        upstream = await run_in_threadpool(
            _http.request,
            request.method,
            f"{CLERK_FRONTEND_API}/{path}",
            params=list(request.query_params.multi_items()),
            headers=headers,
            data=await request.body(),
            allow_redirects=False,
            timeout=30,
        )
    except requests.RequestException:
        return Response(status_code=502)
    response = Response(content=upstream.content, status_code=upstream.status_code)
    raw = upstream.raw.headers
    for name in {n.lower() for n in raw.keys()} - _HOP_HEADERS:
        for value in raw.getlist(name):
            response.raw_headers.append((name.encode(), value.encode()))
    return response


@lru_cache(maxsize=1)
def _jwks_client(secret_key: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(
        f"{CLERK_BACKEND_API}/jwks",
        headers={"Authorization": f"Bearer {secret_key}", "User-Agent": "emergent-clerk-auth"},
        lifespan=3600,
        timeout=10,
    )


def verify_session_token(token: str) -> dict:
    try:
        key = _jwks_client(_secret_key()).get_signing_key_from_jwt(token).key
        return jwt.decode(token, key=key, algorithms=["RS256"], leeway=5)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")


def require_user(request: Request) -> dict:
    if not _secret_key():
        raise HTTPException(status_code=503, detail="Clerk is not configured")
    auth = request.headers.get("authorization", "")
    token = auth[7:] if auth.lower().startswith("bearer ") else request.cookies.get("__session", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not signed in")
    claims = verify_session_token(token)
    return {"user_id": claims["sub"], "session_id": claims.get("sid"), "claims": claims}