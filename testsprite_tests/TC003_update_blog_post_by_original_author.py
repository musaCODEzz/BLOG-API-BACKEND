import requests

BASE_URL = "http://localhost:8000"
HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkzMGYzOWMzNTFhOThlNTgwMDc0MjIiLCJpYXQiOjE3ODgxODE2NjgsImV4cCI6MTc4ODE4NTI2OH0.XOsRh154iJ2PFEVeC9xvnekOX7AbyT5NKIGM0mfabcA",
    "Content-Type": "application/json",
}
TIMEOUT = 30

def test_update_blog_post_by_original_author():
    post_id = None
    try:
        # Step 1: Create a new blog post as the authenticated user
        create_payload = {
            "title": "Original Author Post",
            "content": "This is the initial content of the blog post."
        }
        create_response = requests.post(
            f"{BASE_URL}/api/blogs",
            headers=HEADERS,
            json=create_payload,
            timeout=TIMEOUT,
        )
        assert create_response.status_code == 201, f"Blog post creation failed: {create_response.text}"
        created_post = create_response.json()
        assert "id" in created_post or "_id" in created_post, f"Created post missing id: {created_post}"
        post_id = created_post.get("id") or created_post.get("_id")

        # Step 2: Update the blog post with the original author credentials (should succeed)
        update_payload = {
            "title": "Updated Title by Original Author",
            "content": "This content has been updated by the original author."
        }
        update_response = requests.put(
            f"{BASE_URL}/api/blogs/{post_id}",
            headers=HEADERS,
            json=update_payload,
            timeout=TIMEOUT,
        )
        assert update_response.status_code == 200, f"Update by original author failed: {update_response.text}"
        updated_post = update_response.json()
        assert updated_post.get("title") == update_payload["title"], "Title not updated correctly"
        assert updated_post.get("content") == update_payload["content"], "Content not updated correctly"

        # Step 3: Attempt update with a different user token (should fail with 403 or 401)
        different_user_headers = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMxMjM0NTY3ODkwMTIzNDU2NyIsImlhdCI6MTc4ODE4MTY2OCwiZXhwIjoxNzg4MTg1MjY4fQ.DifferentUserTokenExampleWhichIsInvalidForThisPost",
            "Content-Type": "application/json",
        }
        update_payload_unauth = {
            "title": "Malicious Update Attempt",
            "content": "Trying to update someone else's blog post."
        }
        unauthorized_update_response = requests.put(
            f"{BASE_URL}/api/blogs/{post_id}",
            headers=different_user_headers,
            json=update_payload_unauth,
            timeout=TIMEOUT,
        )
        assert unauthorized_update_response.status_code in (401, 403), (
            f"Unauthorized update did not fail as expected: "
            f"Status {unauthorized_update_response.status_code}, Body {unauthorized_update_response.text}"
        )
    finally:
        # Cleanup: Delete the created blog post with the original author's token
        if post_id:
            try:
                del_response = requests.delete(
                    f"{BASE_URL}/api/blogs/{post_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
                # It's ok if deletion fails, but log it by assertion
                assert del_response.status_code == 200 or del_response.status_code == 204, (
                    f"Cleanup delete failed: {del_response.status_code} {del_response.text}"
                )
            except Exception as e:
                pass

test_update_blog_post_by_original_author()