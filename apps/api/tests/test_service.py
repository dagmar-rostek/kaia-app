from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.domains.users.models import User, UserStatus
from app.domains.users.schemas import RegisterRequest
from app.domains.users.service import AuthError, AuthService, UserService


@pytest.fixture
def user_repo():
    repo = AsyncMock()
    repo.get_by_email = AsyncMock(return_value=None)
    repo.get_by_username = AsyncMock(return_value=None)
    repo.create = AsyncMock(side_effect=lambda u: u)
    repo.save = AsyncMock(side_effect=lambda u: u)
    return repo


@pytest.fixture
def token_repo():
    repo = AsyncMock()
    repo.create = AsyncMock()
    repo.revoke_all_for_user = AsyncMock()
    repo.get_by_hash = AsyncMock(return_value=None)
    return repo


@pytest.fixture
def auth_service(user_repo, token_repo):
    return AuthService(user_repo, token_repo)


@pytest.fixture
def user_service(user_repo, token_repo):
    return UserService(user_repo, token_repo)


@pytest.fixture
def register_data():
    return RegisterRequest(
        email="test@example.com",
        username="testuser",
        password="securepassword123",
        consent_data=True,
        consent_research_data=True,
        consent_analytics=False,
    )


def _make_user(status: UserStatus = UserStatus.ACTIVE, password: str = "correctpassword") -> User:
    from app.core.security import hash_password

    user = MagicMock()
    user.id = 1
    user.email = "test@example.com"
    user.username = "testuser"
    user.password_hash = hash_password(password)
    user.status = status
    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = None
    return user


# ── AuthService.register ──────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_register_success(auth_service, user_repo, register_data):
    with patch("app.domains.users.service.notify", new_callable=AsyncMock):
        user = await auth_service.register(register_data)
    assert user.email == "test@example.com"
    assert user.status == UserStatus.PENDING
    user_repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_register_duplicate_email(auth_service, user_repo, register_data):
    user_repo.get_by_email = AsyncMock(return_value=MagicMock())
    with pytest.raises(AuthError) as exc:
        await auth_service.register(register_data)
    assert exc.value.status_code == 409
    assert "E-Mail" in exc.value.message


@pytest.mark.asyncio
async def test_register_duplicate_username(auth_service, user_repo, register_data):
    user_repo.get_by_username = AsyncMock(return_value=MagicMock())
    with pytest.raises(AuthError) as exc:
        await auth_service.register(register_data)
    assert exc.value.status_code == 409
    assert "Benutzername" in exc.value.message


# ── AuthService.login ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_login_success(auth_service, user_repo, token_repo):
    user_repo.get_by_email = AsyncMock(return_value=_make_user())
    with patch("app.domains.users.service.verify_password", return_value=True):
        access, refresh = await auth_service.login("test@example.com", "correctpassword")
    assert isinstance(access, str)
    assert isinstance(refresh, str)
    token_repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_login_user_not_found(auth_service, user_repo):
    user_repo.get_by_email = AsyncMock(return_value=None)
    with pytest.raises(AuthError) as exc:
        await auth_service.login("nobody@example.com", "password")
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_login_wrong_password(auth_service, user_repo):
    user_repo.get_by_email = AsyncMock(return_value=_make_user())
    with patch("app.domains.users.service.verify_password", return_value=False):
        with pytest.raises(AuthError) as exc:
            await auth_service.login("test@example.com", "wrongpassword")
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_login_locked_account(auth_service, user_repo):
    user = _make_user()
    user.locked_until = datetime.now(UTC) + timedelta(minutes=10)
    user_repo.get_by_email = AsyncMock(return_value=user)
    with pytest.raises(AuthError) as exc:
        await auth_service.login("test@example.com", "anypassword")
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_login_pending_user(auth_service, user_repo):
    user_repo.get_by_email = AsyncMock(return_value=_make_user(status=UserStatus.PENDING))
    with patch("app.domains.users.service.verify_password", return_value=True):
        with pytest.raises(AuthError) as exc:
            await auth_service.login("test@example.com", "correctpassword")
    assert exc.value.status_code == 403
    assert "Freigabe" in exc.value.message


@pytest.mark.asyncio
async def test_login_suspended_user(auth_service, user_repo):
    user_repo.get_by_email = AsyncMock(return_value=_make_user(status=UserStatus.SUSPENDED))
    with patch("app.domains.users.service.verify_password", return_value=True):
        with pytest.raises(AuthError) as exc:
            await auth_service.login("test@example.com", "correctpassword")
    assert exc.value.status_code == 403


# ── AuthService.refresh ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_refresh_invalid_token(auth_service, token_repo):
    token_repo.get_by_hash = AsyncMock(return_value=None)
    with pytest.raises(AuthError) as exc:
        await auth_service.refresh("invalidtoken")
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_refresh_reuse_detected(auth_service, token_repo):
    stored = MagicMock()
    stored.revoked_at = datetime.now(UTC)  # already revoked = reuse
    stored.family = "test-family"
    stored.user_id = 1
    token_repo.get_by_hash = AsyncMock(return_value=stored)
    token_repo.revoke_family = AsyncMock()
    with pytest.raises(AuthError) as exc:
        await auth_service.refresh("sometoken")
    assert exc.value.status_code == 401
    assert "Wiederverwendung" in exc.value.message


# ── AuthService.logout ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_logout(auth_service, token_repo):
    await auth_service.logout(1)
    token_repo.revoke_all_for_user.assert_called_once_with(1, "logout")


# ── AuthService.acknowledge_disclosure ───────────────────────────────────────


@pytest.mark.asyncio
async def test_acknowledge_disclosure(auth_service, user_repo):
    user = _make_user()
    user.ki_disclosure_seen_at = None
    await auth_service.acknowledge_disclosure(user)
    assert user.ki_disclosure_seen_at is not None
    user_repo.save.assert_called_once()


# ── UserService ───────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_user_export_returns_user(user_service):
    user = _make_user()
    result = await user_service.export(user)
    assert result is user


@pytest.mark.asyncio
async def test_user_delete_anonymizes(user_service, token_repo, user_repo):
    user = _make_user()
    await user_service.delete(user, "user_request")
    assert user.status == UserStatus.DELETED
    assert "anonymized" in user.email
    token_repo.revoke_all_for_user.assert_called_once()


@pytest.mark.asyncio
async def test_user_update_consent(user_service, user_repo):
    user = _make_user()
    user.consent_analytics = False
    await user_service.update_consent(user, True)
    assert user.consent_analytics is True
    user_repo.save.assert_called_once()
