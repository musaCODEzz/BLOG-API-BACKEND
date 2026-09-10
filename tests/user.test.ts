// tests/user.test.ts
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Auth flow", () => {
    const testUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    };

    it("registers a new user successfully", async () => {
        const response = await request(app)
            .post("/api/users/register")
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty("email", testUser.email);
        // The password must NEVER be sent back in the response — this is a real security check.
        expect(response.body.user).not.toHaveProperty("password");
    });

    it("rejects a duplicate registration with the same email", async () => {
        // Register once...
        await request(app).post("/api/users/register").send(testUser);

        // ...then try again with the same email.
        const response = await request(app)
            .post("/api/users/register")
            .send(testUser);

        expect(response.status).toBe(409);
    });

    it("logs in successfully and returns a token", async () => {
        await request(app).post("/api/users/register").send(testUser);

        const response = await request(app)
            .post("/api/users/login")
            .send({ email: testUser.email, password: testUser.password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(typeof response.body.token).toBe("string");
    });

    it("rejects login with the wrong password", async () => {
        await request(app).post("/api/users/register").send(testUser);

        const response = await request(app)
            .post("/api/users/login")
            .send({ email: testUser.email, password: "wrongpassword" });

        expect(response.status).toBe(401);
    });

        it("rejects getting profile without a token", async () => {
        const response = await request(app).get("/api/users/profile");
        expect(response.status).toBe(401);
    });

    it("retrieves current user profile when authenticated", async () => {
        // Register and login to get a fresh token
        await request(app).post("/api/users/register").send(testUser);
        const loginRes = await request(app)
            .post("/api/users/login")
            .send({ email: testUser.email, password: testUser.password });

        const token = loginRes.body.token;

        // Fetch profile
        const response = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty("email", testUser.email);
        expect(response.body.user).toHaveProperty("name", testUser.name);
        // Security check: ensure password hash is never exposed
        expect(response.body.user).not.toHaveProperty("password");
    });

        it("retrieves blogs by author ID successfully", async () => {
        // 1. Register and login a user
        const regRes = await request(app).post("/api/users/register").send({
            name: "Blogger Author",
            email: "author.blogs@example.com",
            password: "password123"
        });
        const userId = regRes.body._id;

        const loginRes = await request(app).post("/api/users/login").send({
            email: "author.blogs@example.com",
            password: "password123"
        });
        const token = loginRes.body.token;

        // 2. Create a blog post authored by this user
        await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Author's Article", content: "Great article content" });

        // 3. Publicly fetch all blogs by this author ID
        const response = await request(app).get(`/api/users/${userId}/blogs`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("count", 1);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data[0]).toHaveProperty("title", "Author's Article");
    });

    it("returns 404 when author ID is invalid", async () => {
        const response = await request(app).get("/api/users/invalid-id-format/blogs");
        expect(response.status).toBe(404);
    });
        it("generates a reset token for a registered email", async () => {
        await request(app).post("/api/users/register").send({
            name: "Forgot Tester",
            email: "forgot@example.com",
            password: "oldpassword123"
        });

        const response = await request(app)
            .post("/api/users/forgot-password")
            .send({ email: "forgot@example.com" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("resetToken");
        expect(typeof response.body.resetToken).toBe("string");
    });

    it("does not leak whether an unknown email exists (anti-enumeration)", async () => {
        const response = await request(app)
            .post("/api/users/forgot-password")
            .send({ email: "nonexistent@example.com" });

        expect(response.status).toBe(200);
        expect(response.body.resetToken).toBeUndefined();
    });

    it("resets password using valid token and allows login with new password", async () => {
        // 1. Register a user
        await request(app).post("/api/users/register").send({
            name: "Reset Tester",
            email: "reset@example.com",
            password: "oldpassword123"
        });

        // 2. Request reset token
        const forgotRes = await request(app)
            .post("/api/users/forgot-password")
            .send({ email: "reset@example.com" });
        const token = forgotRes.body.resetToken;

        // 3. Reset password using the token
        const resetRes = await request(app)
            .post("/api/users/reset-password")
            .send({ token, password: "newBrandPassword123" });

        expect(resetRes.status).toBe(200);

        // 4. Verify old password no longer works
        const failedLogin = await request(app)
            .post("/api/users/login")
            .send({ email: "reset@example.com", password: "oldpassword123" });
        expect(failedLogin.status).toBe(401);

        // 5. Verify new password logs in successfully
        const successfulLogin = await request(app)
            .post("/api/users/login")
            .send({ email: "reset@example.com", password: "newBrandPassword123" });
        expect(successfulLogin.status).toBe(200);
        expect(successfulLogin.body).toHaveProperty("token");

        // 6. Verify one-time use: re-using the same token fails
        const reuseRes = await request(app)
            .post("/api/users/reset-password")
            .send({ token, password: "anotherPassword123" });
        expect(reuseRes.status).toBe(400);
    });

    describe("Google OAuth flow", () => {
        it("rejects google login without credential", async () => {
            const response = await request(app)
                .post("/api/users/google-login")
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toContain("credential");
        });

        it("rejects invalid or expired google token", async () => {
            vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify({ error_description: "Invalid Value" }), { status: 400 })
            );

            const response = await request(app)
                .post("/api/users/google-login")
                .send({ credential: "invalid_dummy_token" });

            expect(response.status).toBe(401);
            expect(response.body.error).toContain("Invalid or expired");
        });

        it("registers and logs in a new user with valid google credential", async () => {
            const mockGooglePayload = {
                email: "googleuser@example.com",
                name: "Google Explorer",
                picture: "https://lh3.googleusercontent.com/avatar.jpg",
                sub: "google-123456789",
                email_verified: "true"
            };

            vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify(mockGooglePayload), { status: 200 })
            );

            const response = await request(app)
                .post("/api/users/google-login")
                .send({ credential: "valid_mock_google_token" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user).toHaveProperty("email", "googleuser@example.com");
            expect(response.body.user).toHaveProperty("name", "Google Explorer");
            expect(response.body.user).toHaveProperty("avatar", "https://lh3.googleusercontent.com/avatar.jpg");
            expect(response.body.user).toHaveProperty("authProvider", "google");
        });

        it("links googleId and avatar to existing user with same email", async () => {
            // First create a regular user
            await request(app).post("/api/users/register").send({
                name: "Pre-existing User",
                email: "linkme@example.com",
                password: "password123"
            });

            // Now sign in with Google with matching email
            const mockGooglePayload = {
                email: "linkme@example.com",
                name: "Google Name",
                picture: "https://lh3.googleusercontent.com/pic.jpg",
                sub: "google-987654321",
                email_verified: true
            };

            vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify(mockGooglePayload), { status: 200 })
            );

            const response = await request(app)
                .post("/api/users/google-login")
                .send({ credential: "mock_link_token" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user).toHaveProperty("email", "linkme@example.com");
            expect(response.body.user).toHaveProperty("googleId", "google-987654321");
            expect(response.body.user).toHaveProperty("avatar", "https://lh3.googleusercontent.com/pic.jpg");
        });
    });

    describe("Profile management & Bookmarks", () => {
        it("rejects updating profile without authentication", async () => {
            const response = await request(app)
                .put("/api/users/profile")
                .send({ bio: "Hacker" });
            expect(response.status).toBe(401);
        });

        it("updates profile details (name, bio, avatar, socials) successfully", async () => {
            // 1. Register & login
            const email = "profiletest@example.com";
            await request(app).post("/api/users/register").send({
                name: "Initial Name",
                email,
                password: "password123"
            });
            const loginRes = await request(app).post("/api/users/login").send({
                email,
                password: "password123"
            });
            const token = loginRes.body.token;

            // 2. Update profile
            const updateRes = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Updated Name",
                    bio: "Full Stack Engineer & OSS enthusiast",
                    avatar: "https://example.com/my-photo.png",
                    website: "https://mysite.dev",
                    github: "myghhandle",
                    twitter: "mytwhandle"
                });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.user).toHaveProperty("name", "Updated Name");
            expect(updateRes.body.user).toHaveProperty("bio", "Full Stack Engineer & OSS enthusiast");
            expect(updateRes.body.user).toHaveProperty("avatar", "https://example.com/my-photo.png");
            expect(updateRes.body.user).toHaveProperty("website", "https://mysite.dev");
            expect(updateRes.body.user).toHaveProperty("github", "myghhandle");
            expect(updateRes.body.user).toHaveProperty("twitter", "mytwhandle");
            expect(updateRes.body.user).not.toHaveProperty("password");

            // 3. Verify changes persist on GET /api/users/profile
            const getRes = await request(app)
                .get("/api/users/profile")
                .set("Authorization", `Bearer ${token}`);
            expect(getRes.status).toBe(200);
            expect(getRes.body.user.bio).toBe("Full Stack Engineer & OSS enthusiast");
        });

        it("changes password via profile update with valid current password and rejects invalid current password", async () => {
            const email = "pwdchange@example.com";
            await request(app).post("/api/users/register").send({
                name: "Password Changer",
                email,
                password: "originalPassword123"
            });
            const loginRes = await request(app).post("/api/users/login").send({
                email,
                password: "originalPassword123"
            });
            const token = loginRes.body.token;

            // Attempt change with wrong old password
            const failRes = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    oldPassword: "wrongOldPassword",
                    newPassword: "brandNewSecurePassword123"
                });
            expect(failRes.status).toBe(400);

            // Change with correct old password
            const successRes = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    oldPassword: "originalPassword123",
                    newPassword: "brandNewSecurePassword123"
                });
            expect(successRes.status).toBe(200);

            // Verify old password fails
            const failedLogin = await request(app).post("/api/users/login").send({
                email,
                password: "originalPassword123"
            });
            expect(failedLogin.status).toBe(401);

            // Verify new password succeeds
            const successfulLogin = await request(app).post("/api/users/login").send({
                email,
                password: "brandNewSecurePassword123"
            });
            expect(successfulLogin.status).toBe(200);
        });

        it("handles bookmarking posts and retrieving paginated bookmarks", async () => {
            // 1. Author registers and creates a blog
            await request(app).post("/api/users/register").send({
                name: "Post Author",
                email: "author.bm@example.com",
                password: "password123"
            });
            const authorLogin = await request(app).post("/api/users/login").send({
                email: "author.bm@example.com",
                password: "password123"
            });
            const blogRes = await request(app)
                .post("/api/blogs")
                .set("Authorization", `Bearer ${authorLogin.body.token}`)
                .send({ title: "Bookmarkable Post", content: "Awesome article to bookmark" });
            const blogId = blogRes.body._id;

            // 2. Reader registers and logs in
            await request(app).post("/api/users/register").send({
                name: "Bookmark Reader",
                email: "reader.bm@example.com",
                password: "password123"
            });
            const readerLogin = await request(app).post("/api/users/login").send({
                email: "reader.bm@example.com",
                password: "password123"
            });
            const readerToken = readerLogin.body.token;

            // 3. Reader bookmarks the post
            const bmRes1 = await request(app)
                .post(`/api/blogs/${blogId}/bookmark`)
                .set("Authorization", `Bearer ${readerToken}`);
            expect(bmRes1.status).toBe(200);
            expect(bmRes1.body.isBookmarked).toBe(true);
            expect(bmRes1.body.totalBookmarks).toBe(1);

            // 4. Fetch user bookmarks
            const listRes = await request(app)
                .get("/api/users/bookmarks")
                .set("Authorization", `Bearer ${readerToken}`);
            expect(listRes.status).toBe(200);
            expect(listRes.body.data.length).toBe(1);
            expect(listRes.body.data[0]._id).toBe(blogId);
            expect(listRes.body.pagination.total).toBe(1);

            // 5. Toggle bookmark off (remove)
            const bmRes2 = await request(app)
                .post(`/api/blogs/${blogId}/bookmark`)
                .set("Authorization", `Bearer ${readerToken}`);
            expect(bmRes2.status).toBe(200);
            expect(bmRes2.body.isBookmarked).toBe(false);
            expect(bmRes2.body.totalBookmarks).toBe(0);

            // 6. Fetch bookmarks again (should be empty)
            const listEmptyRes = await request(app)
                .get("/api/users/bookmarks")
                .set("Authorization", `Bearer ${readerToken}`);
            expect(listEmptyRes.status).toBe(200);
            expect(listEmptyRes.body.data.length).toBe(0);
            expect(listEmptyRes.body.pagination.total).toBe(0);
        });
    });

});