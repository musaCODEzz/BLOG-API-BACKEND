import requests

BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkzMGYzOWMzNTFhOThlNTgwMDc0MjIiLCJpYXQiOjE3ODgxODE2NjgsImV4cCI6MTc4ODE4NTI2OH0.XOsRh154iJ2PFEVeC9xvnekOX7AbyT5NKIGM0mfabcA"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_delete_blog_post_by_original_author():
    blog_post = None
    try:
        # Create a blog post
        create_payload = {
            "title": "Test Blog for Delete TC004",
            "content": "Content for testing delete.",
            "tags": ["test", "delete"]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/blogs",
            json=create_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_response.status_code == 201, f"Expected 201 Created but got {create_response.status_code}"
        blog_post = create_response.json()
        blog_id = blog_post.get("_id") or blog_post.get("id")
        assert blog_id, "Blog post ID not returned in create response"

        # Attempt to delete the blog post as original author (should succeed)
        delete_response = requests.delete(
            f"{BASE_URL}/api/blogs/{blog_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert delete_response.status_code == 204 or delete_response.status_code == 200, \
            f"Expected 204 No Content or 200 OK for delete but got {delete_response.status_code}"

        # Verify blog post is actually deleted by attempting to get it (should 404)
        get_response = requests.get(
            f"{BASE_URL}/api/blogs/{blog_id}",
            timeout=TIMEOUT
        )
        assert get_response.status_code == 404, f"Expected 404 Not Found after delete but got {get_response.status_code}"

    finally:
        # Cleanup: If blog not deleted, delete it here
        if blog_post:
            blog_id = blog_post.get("_id") or blog_post.get("id")
            if blog_id:
                requests.delete(
                    f"{BASE_URL}/api/blogs/{blog_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )


test_delete_blog_post_by_original_author()