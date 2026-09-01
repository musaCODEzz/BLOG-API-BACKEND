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
});