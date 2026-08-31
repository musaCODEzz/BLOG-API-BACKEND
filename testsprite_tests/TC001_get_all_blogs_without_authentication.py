import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_get_all_blogs_without_authentication():
    try:
        # Health check
        health_resp = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        assert health_resp.status_code == 200, f"Health check failed: {health_resp.status_code}"
        assert "health" in health_resp.text.lower(), f"Unexpected health response content: {health_resp.text}"

        # GET /api/blogs without auth
        resp = requests.get(f"{BASE_URL}/api/blogs", timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK but got {resp.status_code}"
        data = resp.json()
        assert isinstance(data, list), "Expected response to be a list of blogs"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"

test_get_all_blogs_without_authentication()