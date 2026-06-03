"""Tests for the admin user-approval API."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.domains.users.models import UserStatus
from app.domains.users.service import UserService


@pytest.fixture
def user_repo() -> AsyncMock:
    repo = AsyncMock()
    repo.save = AsyncMock(side_effect=lambda u: u)
    return repo


@pytest.fixture
def token_repo() -> AsyncMock:
    repo = AsyncMock()
    repo.revoke_all_for_user = AsyncMock()
    return repo


@pytest.fixture
def svc(user_repo: AsyncMock, token_repo: AsyncMock) -> UserService:
    return UserService(user_repo, token_repo)


def _pending_user() -> MagicMock:
    user = MagicMock()
    user.id = 42
    user.email = "test@example.com"
    user.username = "testuser"
    user.status = UserStatus.PENDING
    user.approved_at = None
    user.approved_by = None
    user.deletion_reason = None
    return user


@pytest.mark.asyncio
async def test_approve_sets_active(svc: UserService, user_repo: AsyncMock) -> None:
    user = _pending_user()
    with patch("app.domains.users.service.notify", new_callable=AsyncMock):
        result = await svc.approve_user(user, "admin")
    assert result.status == UserStatus.ACTIVE
    assert result.approved_by == "admin"
    assert result.approved_at is not None
    user_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_approve_sends_slack(svc: UserService) -> None:
    user = _pending_user()
    with patch("app.domains.users.service.notify", new_callable=AsyncMock) as mock_notify:
        await svc.approve_user(user, "admin")
    mock_notify.assert_called_once()


@pytest.mark.asyncio
async def test_reject_sets_suspended(svc: UserService, user_repo: AsyncMock) -> None:
    user = _pending_user()
    result = await svc.reject_user(user, "not_eligible")
    assert result.status == UserStatus.SUSPENDED
    assert result.deletion_reason == "not_eligible"
    user_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_approve_already_active_still_saves(svc: UserService) -> None:
    user = _pending_user()
    user.status = UserStatus.ACTIVE
    with patch("app.domains.users.service.notify", new_callable=AsyncMock):
        result = await svc.approve_user(user, "admin")
    assert result.status == UserStatus.ACTIVE
