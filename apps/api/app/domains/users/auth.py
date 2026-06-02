from typing import Annotated

import structlog
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.domains.users.repository import RefreshTokenRepository, UserRepository
from app.domains.users.schemas import LoginRequest, RegisterRequest, TokenResponse, UserRead
from app.domains.users.service import AuthError, AuthService

log = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_NAME = "refresh_token"
_COOKIE_PATH = "/api/v1/auth/refresh"
_SESSION_COOKIE = "kaia_session"


def _auth_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuthService:
    return AuthService(UserRepository(db), RefreshTokenRepository(db))


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=True,
        samesite="strict",
        path=_COOKIE_PATH,
        max_age=30 * 24 * 60 * 60,
    )


def _set_session_cookie(response: Response) -> None:
    # Non-path-scoped indicator so Next.js middleware can detect authenticated sessions.
    # Contains no sensitive data — actual auth is the path-scoped refresh_token + JWT.
    response.set_cookie(
        key=_SESSION_COOKIE,
        value="1",
        httponly=True,
        secure=True,
        samesite="strict",
        path="/",
        max_age=30 * 24 * 60 * 60,
    )


@router.post("/register", status_code=201)
async def register(
    data: RegisterRequest,
    request: Request,
    svc: Annotated[AuthService, Depends(_auth_service)],
) -> UserRead:
    try:
        user = await svc.register(data, ip=request.client.host if request.client else None)
    except AuthError as e:
        raise HTTPException(e.status_code, e.message) from e
    return UserRead.model_validate(user)


@router.post("/login")
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    svc: Annotated[AuthService, Depends(_auth_service)],
) -> TokenResponse:
    ua = request.headers.get("User-Agent")
    ip = request.client.host if request.client else None
    try:
        access_token, raw_refresh = await svc.login(data.email, data.password, ua, ip)
    except AuthError as e:
        raise HTTPException(e.status_code, e.message) from e
    _set_refresh_cookie(response, raw_refresh)
    _set_session_cookie(response)
    return TokenResponse(access_token=access_token)


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    svc: Annotated[AuthService, Depends(_auth_service)],
    refresh_token: Annotated[str | None, Cookie(alias=_COOKIE_NAME)] = None,
) -> TokenResponse:
    if not refresh_token:
        raise HTTPException(401, "Kein Refresh-Token vorhanden.")
    ua = request.headers.get("User-Agent")
    ip = request.client.host if request.client else None
    try:
        access_token, raw_new = await svc.refresh(refresh_token, ua, ip)
    except AuthError as e:
        raise HTTPException(e.status_code, e.message) from e
    _set_refresh_cookie(response, raw_new)
    _set_session_cookie(response)
    return TokenResponse(access_token=access_token)


@router.post("/logout", status_code=204)
async def logout(
    response: Response,
    current_user: CurrentUser,
    svc: Annotated[AuthService, Depends(_auth_service)],
) -> None:
    await svc.logout(current_user.id)
    response.delete_cookie(key=_COOKIE_NAME, path=_COOKIE_PATH)
    response.delete_cookie(key=_SESSION_COOKIE, path="/")


@router.post("/disclosure-ack", status_code=204)
async def acknowledge_ki_disclosure(
    current_user: CurrentUser,
    svc: Annotated[AuthService, Depends(_auth_service)],
) -> None:
    await svc.acknowledge_disclosure(current_user)
