// tests/health.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /health", () => {
    it("returns 200 and a health message", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
    });
});

describe("GET /", () => {
    it("redirects the root URL to /api-docs", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/api-docs");
    });
});