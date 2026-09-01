// tests/blog.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

// Helper — registers + logs in a user, returns their token.
// Every blog write test needs an authenticated user, so this avoids repeating
// the register/login calls in every single test.
async function registerAndLogin(email: string) {
    const user = { name: "Test Author", email, password: "password123" };

    await request(app).post("/api/users/register").send(user);
    const loginRes = await request(app)
        .post("/api/users/login")
        .send({ email: user.email, password: user.password });

    return loginRes.body.token as string;
}

describe("Blog CRUD", () => {
    it("rejects creating a blog post without a token", async () => {
        const response = await request(app)
            .post("/api/blogs")
            .send({ title: "No Auth Post", content: "Should be rejected" });

        expect(response.status).toBe(401);
    });

    it("creates a blog post when authenticated", async () => {
        const token = await registerAndLogin("author@example.com");

        const response = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "My First Post", content: "Hello world" });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("title", "My First Post");
        expect(response.body).toHaveProperty("_id");
    });

    it("allows anyone to read blogs without a token", async () => {
        const response = await request(app).get("/api/blogs");

        expect(response.status).toBe(200);
    });

    it("prevents a different user from deleting someone else's post", async () => {
        const authorToken = await registerAndLogin("author2@example.com");
        const intruderToken = await registerAndLogin("intruder@example.com");

        const createRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${authorToken}`)
            .send({ title: "Owned Post", content: "Only I can delete this" });

        const postId = createRes.body._id;

        const deleteRes = await request(app)
            .delete(`/api/blogs/${postId}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(deleteRes.status).toBe(403);
    });

    it("allows the original author to delete their own post", async () => {
        const token = await registerAndLogin("author3@example.com");

        const createRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Deletable Post", content: "Goodbye soon" });

        const postId = createRes.body._id;

        const deleteRes = await request(app)
            .delete(`/api/blogs/${postId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteRes.status).toBe(200);
    });
});