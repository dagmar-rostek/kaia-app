"""Test object factories — real domain model instances, no MagicMock.

Usage:
    user = make_user()
    user = make_user(status=UserStatus.PENDING, email="other@example.com")
    session = make_chat_session(user_id=user.id, session_number=2)

These factories create unsaved SQLAlchemy model instances. They do NOT require
a database — use them in unit tests that mock the repository layer.
For integration tests that need persisted objects, call db.add() + db.commit().
"""

from datetime import UTC, datetime

from app.core.security import hash_password
from app.domains.chat.models import ChatSession
from app.domains.users.models import User, UserStatus

_DEFAULT_PW = "securepassword123"  # noqa: S105  — test-only, never deployed


def make_user(
    *,
    pk: int = 1,
    email: str = "test@example.com",
    username: str = "testuser",
    password: str = _DEFAULT_PW,
    status: UserStatus = UserStatus.ACTIVE,
    consent_data: bool = True,
    consent_research_data: bool = True,
    consent_analytics: bool = False,
    onboarding_complete: bool = True,
    failed_login_count: int = 0,
    locked_until: datetime | None = None,
    last_login_at: datetime | None = None,
    learning_topic: str | None = "Python lernen",
    is_simulation: bool = False,
) -> User:
    """Return an unsaved User instance with sensible test defaults."""
    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
        status=status,
        consent_data=consent_data,
        consent_research_data=consent_research_data,
        consent_analytics=consent_analytics,
        consent_version="1.0",
        consent_at=datetime.now(UTC),
        onboarding_complete=onboarding_complete,
        failed_login_count=failed_login_count,
        locked_until=locked_until,
        last_login_at=last_login_at,
        learning_topic=learning_topic,
        is_simulation=is_simulation,
    )
    user.id = pk
    return user


def make_chat_session(
    *,
    pk: int = 1,
    user_id: int = 1,
    character: str = "warm",
    session_number: int = 1,
    daily_plan: str | None = None,
    session_summary: str | None = None,
    ended_at: datetime | None = None,
) -> ChatSession:
    """Return an unsaved ChatSession instance with sensible test defaults."""
    session = ChatSession(
        user_id=user_id,
        character=character,
        session_number=session_number,
        daily_plan=daily_plan,
        session_summary=session_summary,
        ended_at=ended_at,
    )
    session.id = pk
    return session
