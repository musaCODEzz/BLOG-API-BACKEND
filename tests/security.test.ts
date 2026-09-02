// tests/security.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Security Hardening & Middleware", () => {
  it("includes security headers from Helmet", async () => {
    const response = await request(app).get("/health");

    expect(response.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(response.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
  });

  it("sanitizes NoSQL operator injection keys from request body", async () => {
    // Attempt to register with a NoSQL injection payload containing $gt
    const maliciousPayload = {
      name: "Normal Name",
      email: "safe@example.com",
      password: "validpassword123",
      $where: "sleep(5000)",
      nested: {
        $gt: "",
        validField: "ok",
      },
    };

    const response = await request(app)
      .post("/api/users/register")
      .send(maliciousPayload);

    // Should succeed because malicious $ keys were completely stripped by mongoSanitizer
    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty("$where");
  });
});
