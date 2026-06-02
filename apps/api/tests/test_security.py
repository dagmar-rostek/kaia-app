from datetime import UTC, datetime

import jwt
import pytest

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    hash_password,
    hash_token,
    new_token_family,
    verify_password,
)


def test_hash_password_is_not_plaintext():
    hashed = hash_password("testpassword123")
    assert isinstance(hashed, str)
    assert hashed != "testpassword123"


def test_hash_password_different_hashes_same_input():
    # bcrypt produces different hashes for the same input (salted)
    h1 = hash_password("same")
    h2 = hash_password("same")
    assert h1 != h2


def test_verify_password_correct():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correctpassword")
    assert verify_password("wrongpassword", hashed) is False


def test_hash_token_deterministic():
    result = hash_token("sometoken")
    assert result == hash_token("sometoken")
    assert len(result) == 64  # SHA-256 hex digest


def test_hash_token_different_inputs_differ():
    assert hash_token("token1") != hash_token("token2")


def test_create_access_token_is_decodable():
    token = create_access_token(42)
    assert isinstance(token, str)
    user_id = decode_access_token(token)
    assert user_id == 42


def test_decode_access_token_wrong_type_raises():
    payload = {
        "sub": "1",
        "exp": datetime.now(UTC).timestamp() + 3600,
        "type": "refresh",
    }
    bad_token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(bad_token)


def test_create_refresh_token_returns_raw_and_hash():
    raw, hashed = create_refresh_token()
    assert isinstance(raw, str)
    assert isinstance(hashed, str)
    assert raw != hashed
    assert hash_token(raw) == hashed


def test_new_token_family_is_uuid_format():
    family = new_token_family()
    assert isinstance(family, str)
    assert len(family) == 36
    assert family.count("-") == 4
