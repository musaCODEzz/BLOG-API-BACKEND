import requests

BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkzMGYzOWMzNTFhOThlNTgwMDc0MjIiLCJpYXQiOjE3ODgxODE2NjgsImV4cCI6MTc4ODE4NTI2OH0.XOsRh154iJ2PFEVeC9xvnekOX7AbyT5NKIGM0mfabcA"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_create_blog_post_with_authentication():
    url = f"{BASE_URL}/api/blogs"
    payload = {
        "title": "Test Blog Post",
        "content": "This is a test blog post created for TC002.",
        "tags": ["test", "automation"]
    }

    post_id = None
    try:
        response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        data = response.json()
        assert "id" in data or "_id" in data, "Response JSON missing blog post ID"
        post_id = data.get("id") or data.get("_id")
        assert post_id is not None and isinstance(post_id, (str, int)), "Invalid blog post ID value"
        assert data.get("title") == payload["title"], "Title mismatch in response"
        assert data.get("content") == payload["content"], "Content mismatch in response"
    except Exception as e:
        print(f"TC002 failed: {e}")
        raise
    else:
        print("TC002 passed: Blog post created successfully with authentication.")
    finally:
        if post_id:
            try:
                delete_resp = requests.delete(f"{url}/{post_id}", headers=HEADERS, timeout=TIMEOUT)
                # It's okay if delete fails here, no assertion
            except:
                pass

test_create_blog_post_with_authentication()