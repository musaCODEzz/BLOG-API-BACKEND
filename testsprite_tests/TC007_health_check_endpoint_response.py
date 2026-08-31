import requests

def test_health_check_endpoint_response():
    base_url = "http://localhost:8000"
    url = f"{base_url}/health"
    timeout = 30

    try:
        response = requests.get(url, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to /health endpoint failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        data = response.text
        assert "healthy" in data.lower() or "running" in data.lower(), "Response does not contain expected health message"
    else:
        health_values = ["healthy", "running", "ok", "up"]
        assert any(val in str(data).lower() for val in health_values), f"Health message missing or unexpected: {data}"

test_health_check_endpoint_response()