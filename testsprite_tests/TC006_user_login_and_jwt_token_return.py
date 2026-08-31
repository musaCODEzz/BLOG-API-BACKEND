import requests
import jwt

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_user_login_and_jwt_token_return():
    # First, register a new user to have a valid user to login with
    register_url = f"{BASE_URL}/api/users/register"
    user_data = {
        "username": "testuser_tc006",
        "email": "testuser_tc006@example.com",
        "password": "TestPass123!"
    }

    try:
        resp_register = requests.post(register_url, json=user_data, timeout=TIMEOUT)
        assert resp_register.status_code == 201, f"User registration failed with status {resp_register.status_code}: {resp_register.text}"

        # Now, login with the registered user credentials
        login_url = f"{BASE_URL}/api/users/login"
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }

        resp_login = requests.post(login_url, json=login_data, timeout=TIMEOUT)
        assert resp_login.status_code == 200, f"Login failed with status {resp_login.status_code}: {resp_login.text}"

        login_response_json = resp_login.json()
        assert "token" in login_response_json, "JWT token not found in login response"
        token = login_response_json["token"]

        # Validate JWT token structure and decode it without verification to check payload
        try:
            decoded_payload = jwt.decode(token, options={"verify_signature": False})
            assert "userId" in decoded_payload or "sub" in decoded_payload, "JWT payload does not contain user identifier"
            assert "iat" in decoded_payload, "JWT payload missing issued at (iat) claim"
            assert "exp" in decoded_payload, "JWT payload missing expiration (exp) claim"
        except jwt.DecodeError:
            assert False, "Returned token is not a valid JWT"

    finally:
        # Clean up: delete the test user by logging in and using auth to delete if the API supports it
        # Since no delete user API described, no cleanup beyond this
        pass

test_user_login_and_jwt_token_return()