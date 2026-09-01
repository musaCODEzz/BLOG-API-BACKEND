// tests/setup.ts
// Runs automatically before/after the whole test suite (wired up via vitest.config.ts).
import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

// Runs ONCE, before any test file executes.
beforeAll(async () => {
    // A secret is required for jwt.sign/jwt.verify to work — tests never load your real .env,
    // so we set a fake one directly, just for this test run.
    process.env.JWT_SECRET = "test-secret-key-for-vitest";

    // Spin up a real, temporary MongoDB instance living only in memory.
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect Mongoose to that temporary database instead of your real one.
    await mongoose.connect(uri);
});

// Runs after EVERY individual test — wipes all data so tests never leak state into each other.
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key]?.deleteMany({});
    }
});

// Runs ONCE, after all tests finish — tears everything down cleanly.
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});