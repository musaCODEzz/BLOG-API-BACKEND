// tests/user.test.ts
import { describe, it, expect } from "vitest";
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



});