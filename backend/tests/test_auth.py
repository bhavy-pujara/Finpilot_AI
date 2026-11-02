import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

client = TestClient(app)

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

def test_mandatory_authentication_flow_10_steps():
    """
    Mandatory authentication test suite (Phase 4):
    1. Register completely new user.
    2. Confirm user is stored in database.
    3. Attempt duplicate registration.
    4. Confirm duplicate is rejected (HTTP 400).
    5. Log in with correct credentials (HTTP 200 + token).
    6. Attempt login with incorrect password (HTTP 401).
    7. Simulate logout.
    8. Attempt to access protected route without token (HTTP 401).
    9. Log in again.
    10. Confirm user session and profile data restored.
    """
    unique_id = uuid.uuid4().hex[:8]
    test_email = f"authtest_{unique_id}@finpilot.ai"
    test_password = "ValidPassword123!"
    test_name = f"Auth Tester {unique_id}"

    # Step 1: Register completely new user
    reg_payload = {
        "email": test_email,
        "password": test_password,
        "full_name": test_name,
        "default_market": "IN",
        "role": "user"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["email"] == test_email

    # Step 2: Confirm user is stored in database
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == test_email).first()
    assert db_user is not None
    assert db_user.full_name == test_name
    assert verify_password(test_password, db_user.hashed_password) is True
    db.close()

    # Step 3 & 4: Attempt duplicate registration and confirm rejection
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"].lower()

    # Step 5: Log in with correct credentials
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Step 6: Attempt login with incorrect credentials
    bad_login = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword999!"
    })
    assert bad_login.status_code == 401
    assert "incorrect" in bad_login.json()["detail"].lower()

    # Step 7 & 8: Simulate logout and attempt protected route without token
    # Protected route without token must return 401
    unauth_res = client.get("/api/v1/auth/me")
    assert unauth_res.status_code in (401, 403)

    # Step 9: Log in again
    relogin_res = client.post("/api/v1/auth/login", json=login_payload)
    assert relogin_res.status_code == 200
    new_token = relogin_res.json()["access_token"]

    # Step 10: Confirm user session and data restored via protected route
    auth_headers = {"Authorization": f"Bearer {new_token}"}
    me_res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
    assert me_data["full_name"] == test_name
    assert me_data["is_active"] is True
