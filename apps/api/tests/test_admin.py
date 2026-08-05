"""Tests for the admin user-approval API and study_participant management."""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.api.v1.admin import approve_user, set_study_participant
from app.domains.users.models import User, UserStatus
from app.domains.users.schemas import UserApprove
from app.domains.users.service import UserService
from tests.factories import make_user


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


def _pending_user() -> User:
    return make_user(pk=42, status=UserStatus.PENDING)


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


# ── approve_user route: auto-set study_participant ────────────────────────────


@pytest.mark.asyncio
async def test_approve_route_auto_sets_study_participant_for_real_user() -> None:
    pending = make_user(pk=10, status=UserStatus.PENDING, email="real@example.com")
    approved = make_user(pk=10, status=UserStatus.ACTIVE, email="real@example.com")
    approved.is_simulation = False

    db = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()

    mock_svc = AsyncMock()
    mock_svc.approve_user = AsyncMock(return_value=approved)

    with patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=pending)):
        await approve_user(10, UserApprove(approved_by="admin"), db, mock_svc)

    assert approved.study_participant is True
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_approve_route_skips_study_participant_for_simulation_user() -> None:
    pending = make_user(
        pk=11, status=UserStatus.PENDING, email="sim@kaia.internal", is_simulation=True
    )
    approved = make_user(
        pk=11, status=UserStatus.ACTIVE, email="sim@kaia.internal", is_simulation=True
    )
    approved.study_participant = False

    db = AsyncMock()
    db.commit = AsyncMock()

    mock_svc = AsyncMock()
    mock_svc.approve_user = AsyncMock(return_value=approved)

    with patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=pending)):
        await approve_user(11, UserApprove(approved_by="admin"), db, mock_svc)

    # study_participant should NOT be set for simulation/internal users
    assert approved.study_participant is False
    db.commit.assert_not_called()


@pytest.mark.asyncio
async def test_approve_route_already_active_raises_409() -> None:
    active = make_user(pk=12, status=UserStatus.ACTIVE)

    db = AsyncMock()
    mock_svc = AsyncMock()

    with patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=active)):
        with pytest.raises(HTTPException) as exc:
            await approve_user(12, UserApprove(approved_by="admin"), db, mock_svc)
    assert exc.value.status_code == 409


# ── set_study_participant endpoint ────────────────────────────────────────────


@pytest.mark.asyncio
async def test_set_study_participant_true() -> None:
    from app.api.v1.admin import StudyParticipantUpdate

    user = make_user(pk=20)
    user.study_participant = False

    db = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock(side_effect=lambda u: None)

    with patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=user)):
        await set_study_participant(20, StudyParticipantUpdate(study_participant=True), db)

    assert user.study_participant is True
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_set_study_participant_false() -> None:
    from app.api.v1.admin import StudyParticipantUpdate

    user = make_user(pk=21)
    user.study_participant = True

    db = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock(side_effect=lambda u: None)

    update = StudyParticipantUpdate(study_participant=False)
    with patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=user)):
        await set_study_participant(21, update, db)

    assert user.study_participant is False


@pytest.mark.asyncio
async def test_set_study_participant_user_not_found() -> None:
    from app.api.v1.admin import StudyParticipantUpdate

    db = AsyncMock()

    with patch(
        "app.api.v1.admin._get_user_or_404",
        new=AsyncMock(side_effect=HTTPException(404, "not found")),
    ):
        with pytest.raises(HTTPException) as exc:
            await set_study_participant(99, StudyParticipantUpdate(study_participant=True), db)
    assert exc.value.status_code == 404
