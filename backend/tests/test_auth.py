import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing_and_verification():
    pwd = "SecureFinPilotPassword2026!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_lifecycle():
    subject = "user_42"
    token = create_access_token(subject)
    assert isinstance(token, str)
    
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == subject
    assert "exp" in payload
    assert "iat" in payload

def test_invalid_jwt_token_handling():
    invalid_token = "invalid.token.payload"
    payload = decode_access_token(invalid_token)
    assert payload is None
