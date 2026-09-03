import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

async function registerAndLogin(email: string) {
    const user = { name: "Test User", email, password: "password123" };
    await request(app).post("/api/users/register").send(user);
    const res = await request(app).post("/api/users/login").send({ email: user.email, password: user.password });
    return res.body.token as string;
}

describe("Comment System", () => {
    it("rejects commenting without authentication", async () => {
        const res = await request(app)
            .post("/api/blogs/64f1a2b3c4d5e6f7a8b9c0d1/comments")
            .send({ content: "Unauthorized comment" });

        expect(res.status).toBe(401);
    });

    it("creates, reads, and restricts comment deletion to author", async () => {
        const authorToken = await registerAndLogin("commenter1@example.com");
        const intruderToken = await registerAndLogin("commenter2@example.com");

        // 1. Create a blog post
        const blogRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${authorToken}`)
            .send({ title: "Commentable Post", content: "Post body" });
        const blogId = blogRes.body._id;

        // 2. Add comment
        const commentRes = await request(app)
            .post(`/api/blogs/${blogId}/comments`)
            .set("Authorization", `Bearer ${authorToken}`)
            .send({ content: "This is a great post!" });

        expect(commentRes.status).toBe(201);
        expect(commentRes.body.content).toBe("This is a great post!");
        const commentId = commentRes.body._id;

        // 3. Get comments (Public)
        const listRes = await request(app).get(`/api/blogs/${blogId}/comments`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.data.length).toBe(1);

        // 4. Intruder cannot delete author's comment
        const forbiddenRes = await request(app)
            .delete(`/api/blogs/${blogId}/comments/${commentId}`)
            .set("Authorization", `Bearer ${intruderToken}`);
        expect(forbiddenRes.status).toBe(403);

        // 5. Author can delete comment
        const deleteRes = await request(app)
            .delete(`/api/blogs/${blogId}/comments/${commentId}`)
            .set("Authorization", `Bearer ${authorToken}`);
        expect(deleteRes.status).toBe(200);
    });
});
