import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_register_new_user_account():
    # Step 1: Health check to validate core backend flow
    health_resp = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
    assert "healthy" in health_resp.text.lower() or "ok" in health_resp.text.lower(), "Unexpected health check response"

    # Prepare unique user data for registration to avoid conflicts
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "email": unique_email,
        "name": f"user_{uuid.uuid4().hex[:6]}",
        "password": "TestPassword123!"
    }

    # Step 2: Register new user account without authentication
    register_resp = requests.post(f"{BASE_URL}/api/users/register", json=user_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 201 or register_resp.status_code == 200, f"User registration failed: {register_resp.status_code} {register_resp.text}"

    # Validate response contains expected user info or id (based on typical REST API)
    try:
        data = register_resp.json()
    except Exception:
        assert False, f"Response is not valid JSON: {register_resp.text}"

    assert "id" in data or "user" in data, f"Response JSON missing user ID or user info: {data}"

    # Step 3: Verify the new user can login (core backend flow)
    login_payload = {
        "email": user_payload["email"],
        "password": user_payload["password"]
    }

    login_resp = requests.post(f"{BASE_URL}/api/users/login", json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed for registered user: {login_resp.status_code} {login_resp.text}"
    try:
        login_data = login_resp.json()
    except Exception:
        assert False, f"Login response is not valid JSON: {login_resp.text}"

    assert "token" in login_data, "Login response missing JWT token"

    # Step 4: Test blog listing works without auth (core backend flow)
    blogs_resp = requests.get(f"{BASE_URL}/api/blogs", timeout=TIMEOUT)
    assert blogs_resp.status_code == 200, f"Fetching blogs failed: {blogs_resp.status_code} {blogs_resp.text}"
    try:
        blogs_data = blogs_resp.json()
    except Exception:
        assert False, f"Blogs response is not valid JSON: {blogs_resp.text}"
    assert isinstance(blogs_data, list), "Blogs response is not a list"

test_register_new_user_account()
