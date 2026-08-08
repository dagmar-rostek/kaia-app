"""Tests for the admin user-approval API and study_participant management."""

from unittest.mock import AsyncMock, MagicMock, patch

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


# ── get_participants_progress ─────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_participants_progress_empty() -> None:
    """No active study participants → empty list, single DB call."""
    from app.api.v1.admin import get_participants_progress

    db = AsyncMock()
    empty = MagicMock()
    empty.scalars.return_value.all.return_value = []
    db.execute = AsyncMock(return_value=empty)

    result = await get_participants_progress(db)

    assert result == []
    db.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_participants_progress_returns_fields() -> None:
    """Returns session count and survey flags per participant."""
    from app.api.v1.admin import get_participants_progress
    from app.domains.survey.models import MeasurementType

    user = make_user(pk=5, username="alice")
    user.study_participant = True
    user.preferred_name = "Alice"

    users_mock = MagicMock()
    users_mock.scalars.return_value.all.return_value = [user]

    session_row = MagicMock()
    session_row.user_id = 5
    session_row.max_session = 3

    gse_row = MagicMock()
    gse_row.user_id = 5
    gse_row.measurement_type = MeasurementType.PRE

    db = AsyncMock()
    db.execute = AsyncMock(side_effect=[users_mock, [session_row], [gse_row]])

    result = await get_participants_progress(db)

    assert len(result) == 1
    item = result[0]
    assert item["user_id"] == 5
    assert item["display_name"] == "Alice"
    assert item["current_session"] == 3
    assert item["pre_survey_done"] is True
    assert item["post_survey_done"] is False


@pytest.mark.asyncio
async def test_get_participants_progress_post_survey_done() -> None:
    """User with both pre and post GSE → both flags True."""
    from app.api.v1.admin import get_participants_progress
    from app.domains.survey.models import MeasurementType

    user = make_user(pk=7, username="bob")
    user.study_participant = True
    user.preferred_name = None

    users_mock = MagicMock()
    users_mock.scalars.return_value.all.return_value = [user]

    session_row = MagicMock()
    session_row.user_id = 7
    session_row.max_session = 10

    pre_row = MagicMock()
    pre_row.user_id = 7
    pre_row.measurement_type = MeasurementType.PRE

    post_row = MagicMock()
    post_row.user_id = 7
    post_row.measurement_type = MeasurementType.POST

    db = AsyncMock()
    db.execute = AsyncMock(side_effect=[users_mock, [session_row], [pre_row, post_row]])

    result = await get_participants_progress(db)

    assert result[0]["pre_survey_done"] is True
    assert result[0]["post_survey_done"] is True
    assert result[0]["display_name"] == "bob"


# ── send_study_start_emails ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_send_study_start_emails_skips_internal_users() -> None:
    """Internal @kaia.internal users are excluded from bulk email."""
    from app.api.v1.admin import send_study_start_emails

    real_user = make_user(pk=1, email="real@example.com", username="real")
    internal_user = make_user(pk=2, email="admin@kaia.internal", username="internal")

    db = AsyncMock()

    with (
        patch("app.api.v1.admin.UserRepository") as mock_repo_cls,
        patch("app.api.v1.admin.send_study_start", new_callable=AsyncMock) as mock_send,
    ):
        mock_repo = AsyncMock()
        mock_repo.get_all = AsyncMock(return_value=[real_user, internal_user])
        mock_repo_cls.return_value = mock_repo

        result = await send_study_start_emails(db)

    assert result == {"sent": 1}
    mock_send.assert_called_once_with("real", "real@example.com")


# ── reset_test_user ───────────────────────────────────────────────────────────


# ── send_single_study_start_mail ─────────────────────────────────────────────


@pytest.mark.asyncio
async def test_send_single_study_start_mail_sends_email() -> None:
    from app.api.v1.admin import send_single_study_start_mail

    user = make_user(pk=30, email="one@example.com", username="one")
    db = AsyncMock()

    with (
        patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=user)),
        patch("app.api.v1.admin.send_study_start", new_callable=AsyncMock) as mock_send,
    ):
        result = await send_single_study_start_mail(30, db)

    assert result == {"sent": "one@example.com"}
    mock_send.assert_called_once_with("one", "one@example.com")


@pytest.mark.asyncio
async def test_send_single_study_start_mail_inactive_raises_400() -> None:
    from app.api.v1.admin import send_single_study_start_mail

    user = make_user(pk=31, status=UserStatus.PENDING)
    db = AsyncMock()

    with patch("app.api.v1.admin._get_user_or_404", new=AsyncMock(return_value=user)):
        with pytest.raises(HTTPException) as exc:
            await send_single_study_start_mail(31, db)
    assert exc.value.status_code == 400


# ── reset_test_user ───────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_reset_test_user_no_op_when_not_found() -> None:
    """When admin_test user doesn't exist, function returns without error."""
    from app.api.v1.admin import reset_test_user

    db = AsyncMock()

    with (
        patch("app.api.v1.admin.UserRepository") as mock_repo_cls,
        patch("app.api.v1.admin.ChatRepository") as mock_chat_cls,
    ):
        mock_repo = AsyncMock()
        mock_repo.get_by_email = AsyncMock(return_value=None)
        mock_repo_cls.return_value = mock_repo

        await reset_test_user(db)

    mock_chat_cls.assert_not_called()


@pytest.mark.asyncio
async def test_reset_test_user_deletes_chat_data() -> None:
    """When admin_test user exists, deletes all their chat data."""
    from app.api.v1.admin import reset_test_user

    test_user = make_user(pk=99, email="admin_test@kaia.internal")
    db = AsyncMock()

    with (
        patch("app.api.v1.admin.UserRepository") as mock_repo_cls,
        patch("app.api.v1.admin.ChatRepository") as mock_chat_cls,
    ):
        mock_repo = AsyncMock()
        mock_repo.get_by_email = AsyncMock(return_value=test_user)
        mock_repo_cls.return_value = mock_repo

        mock_chat_repo = AsyncMock()
        mock_chat_repo.delete_user_data = AsyncMock()
        mock_chat_cls.return_value = mock_chat_repo

        await reset_test_user(db)

    mock_chat_repo.delete_user_data.assert_called_once_with(99)
