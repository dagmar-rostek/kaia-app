import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import settings

_ROUNDS = 12


def _prepare(plain: str) -> bytes:
    # SHA-256 pre-hash avoids bcrypt's 72-byte truncation limit.
    # The hex digest (64 ASCII chars) is always within bcrypt's input range.
    return hashlib.sha256(plain.encode()).hexdigest().encode()


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_prepare(plain), bcrypt.gensalt(rounds=_ROUNDS)).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_prepare(plain), hashed.encode())


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


def create_access_token(user_id: int, expire_minutes: int | None = None) -> str:
    minutes = expire_minutes if expire_minutes is not None else settings.access_token_expire_minutes
    expire = datetime.now(UTC) + timedelta(minutes=minutes)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("not an access token")
    return int(payload["sub"])


def create_refresh_token() -> tuple[str, str]:
    """Returns (raw_token, token_hash). Store only the hash."""
    raw = secrets.token_urlsafe(48)
    return raw, hash_token(raw)


def new_token_family() -> str:
    return str(uuid.uuid4())
