from datetime import UTC, datetime, timedelta

import structlog

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_token,
    new_token_family,
    verify_password,
    hash_password,
)
from app.domains.users.models import RefreshToken, User, UserStatus
from app.domains.users.repository import RefreshTokenRepository, UserRepository
from app.domains.users.schemas import RegisterRequest

log = structlog.get_logger()

_MAX_FAILED_ATTEMPTS = 5
_LOCK_MINUTES = 15


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        token_repo: RefreshTokenRepository,
    ) -> None:
        self._users = user_repo
        self._tokens = token_repo

    async def register(self, data: RegisterRequest, ip: str | None = None) -> User:
        if await self._users.get_by_email(data.email):
            raise AuthError("E-Mail bereits vergeben.", 409)
        if await self._users.get_by_username(data.username):
            raise AuthError("Benutzername bereits vergeben.", 409)

        now = datetime.now(UTC)
        user = User(
            email=data.email,
            username=data.username,
            password_hash=hash_password(data.password),
            status=UserStatus.PENDING,
            consent_data=True,
            consent_analytics=data.consent_analytics,
            consent_version=data.consent_version,
            consent_at=now,
        )
        user = await self._users.create(user)
        log.info("user_registered", user_id=user.id, email=user.email)
        return user

    async def login(
        self,
        email: str,
        password: str,
        user_agent: str | None = None,
        ip: str | None = None,
    ) -> tuple[str, str]:
        """Returns (access_token, raw_refresh_token)."""
        user = await self._users.get_by_email(email)
        if not user:
            raise AuthError("Ungültige Anmeldedaten.", 401)

        now = datetime.now(UTC)

        if user.locked_until and user.locked_until > now:
            raise AuthError("Konto temporär gesperrt. Bitte später erneut versuchen.", 403)

        if not verify_password(password, user.password_hash):
            user.failed_login_count += 1
            if user.failed_login_count >= _MAX_FAILED_ATTEMPTS:
                user.locked_until = now + timedelta(minutes=_LOCK_MINUTES)
                log.warning("account_locked", user_id=user.id)
            await self._users.save(user)
            raise AuthError("Ungültige Anmeldedaten.", 401)

        if user.status == UserStatus.PENDING:
            raise AuthError("Konto wartet auf Admin-Freigabe.", 403)
        if user.status == UserStatus.SUSPENDED:
            raise AuthError("Konto gesperrt.", 403)
        if user.status == UserStatus.DELETED:
            raise AuthError("Konto nicht gefunden.", 401)

        user.failed_login_count = 0
        user.locked_until = None
        user.last_login_at = now
        await self._users.save(user)

        access_token = create_access_token(user.id)
        raw_refresh, refresh_hash = create_refresh_token()
        family = new_token_family()

        token = RefreshToken(
            user_id=user.id,
            token_hash=refresh_hash,
            family=family,
            expires_at=now + timedelta(days=settings.refresh_token_expire_days),
            user_agent=user_agent,
            ip_address=ip,
        )
        await self._tokens.create(token)
        log.info("user_logged_in", user_id=user.id)
        return access_token, raw_refresh

    async def refresh(
        self,
        raw_token: str,
        user_agent: str | None = None,
        ip: str | None = None,
    ) -> tuple[str, str]:
        """Validate refresh token, rotate it, return new (access_token, raw_refresh_token)."""
        token_hash = hash_token(raw_token)
        stored = await self._tokens.get_by_hash(token_hash)

        if not stored:
            raise AuthError("Ungültiger Token.", 401)

        now = datetime.now(UTC)

        if stored.revoked_at is not None:
            # Reuse detected — revoke entire family
            await self._tokens.revoke_family(stored.family, "reuse_detected")
            log.warning("refresh_token_reuse", user_id=stored.user_id, family=stored.family)
            raise AuthError("Token-Wiederverwendung erkannt. Bitte erneut anmelden.", 401)

        if stored.expires_at < now:
            stored.revoked_at = now
            stored.revoke_reason = "expired"
            await self._tokens.revoke_family(stored.family, "expired")
            raise AuthError("Token abgelaufen.", 401)

        # Revoke used token
        stored.revoked_at = now
        stored.revoke_reason = "rotated"

        # Issue new tokens
        access_token = create_access_token(stored.user_id)
        raw_new, new_hash = create_refresh_token()

        new_token = RefreshToken(
            user_id=stored.user_id,
            token_hash=new_hash,
            family=stored.family,  # same family — allows full revocation
            expires_at=now + timedelta(days=settings.refresh_token_expire_days),
            user_agent=user_agent,
            ip_address=ip,
        )
        await self._tokens.create(new_token)
        return access_token, raw_new

    async def logout(self, user_id: int) -> None:
        await self._tokens.revoke_all_for_user(user_id, "logout")
        log.info("user_logged_out", user_id=user_id)

    async def acknowledge_disclosure(self, user: User) -> User:
        user.ki_disclosure_seen_at = datetime.now(UTC)
        return await self._users.save(user)
