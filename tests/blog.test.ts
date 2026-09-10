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

    it("toggles likes on a blog post and rejects unauthenticated requests", async () => {
        const authorToken = await registerAndLogin("likeauthor@example.com");
        const readerToken = await registerAndLogin("likereader@example.com");

        // 1. Create a blog post
        const createRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${authorToken}`)
            .send({ title: "Likable Post", content: "Like me please" });
        const postId = createRes.body._id;

        // 2. Unauthenticated like fails (401)
        const unauthRes = await request(app).post(`/api/blogs/${postId}/like`);
        expect(unauthRes.status).toBe(401);

        // 3. First like adds like (200, isLiked: true, likesCount: 1)
        const likeRes = await request(app)
            .post(`/api/blogs/${postId}/like`)
            .set("Authorization", `Bearer ${readerToken}`);
        expect(likeRes.status).toBe(200);
        expect(likeRes.body.isLiked).toBe(true);
        expect(likeRes.body.likesCount).toBe(1);

        // 4. Second like toggles it off / unlikes (200, isLiked: false, likesCount: 0)
        const unlikeRes = await request(app)
            .post(`/api/blogs/${postId}/like`)
            .set("Authorization", `Bearer ${readerToken}`);
        expect(unlikeRes.status).toBe(200);
        expect(unlikeRes.body.isLiked).toBe(false);
        expect(unlikeRes.body.likesCount).toBe(0);

        // 5. Liking a non-existent blog post returns 404
        const notFoundRes = await request(app)
            .post("/api/blogs/64f1a2b3c4d5e6f7a8b9c0d1/like")
            .set("Authorization", `Bearer ${readerToken}`);
        expect(notFoundRes.status).toBe(404);
    });

    it("supports creating blogs with tags, filtering by tag, and fetching popular tags", async () => {
        const token = await registerAndLogin("tagauthor@example.com");

        // 1. Create posts with tags
        await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Post with TS and Docker",
                content: "Content about TS and Docker",
                tags: ["TypeScript", " Docker ", "typescript"] // tests normalization & duplicate removal
            });

        await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Post with React and TS",
                content: "Content about React and TS",
                tags: "react, typescript" // tests comma-separated string format
            });

        await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Post with Python only",
                content: "Content about Python",
                tags: ["python"]
            });

        // 2. Filter blogs by tag: typescript (should return 2 posts)
        const tsFilterRes = await request(app).get("/api/blogs?tag=typescript");
        expect(tsFilterRes.status).toBe(200);
        expect(tsFilterRes.body.data.length).toBe(2);
        expect(tsFilterRes.body.data[0].tags).toContain("typescript");

        // 3. Filter blogs by tag: docker (should return 1 post)
        const dockerFilterRes = await request(app).get("/api/blogs?tag=docker");
        expect(dockerFilterRes.status).toBe(200);
        expect(dockerFilterRes.body.data.length).toBe(1);
        expect(dockerFilterRes.body.data[0].tags).toContain("docker");

        // 4. Filter by non-existent tag (should return 0 posts)
        const emptyFilterRes = await request(app).get("/api/blogs?tag=nonexistenttag");
        expect(emptyFilterRes.status).toBe(200);
        expect(emptyFilterRes.body.data.length).toBe(0);

        // 5. Fetch popular tags
        const tagsRes = await request(app).get("/api/blogs/tags");
        expect(tagsRes.status).toBe(200);
        expect(tagsRes.body).toHaveProperty("tags");
        expect(Array.isArray(tagsRes.body.tags)).toBe(true);
        // typescript should have count 2
        const tsTag = tagsRes.body.tags.find((t: { tag: string; count: number }) => t.tag === "typescript");
        expect(tsTag).toBeDefined();
        expect(tsTag.count).toBe(2);
    });
});