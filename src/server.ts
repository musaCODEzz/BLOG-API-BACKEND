import express from "express";
import type { Request, Response, Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { blogRouter } from "./routes/blog.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";

// load environment variables from .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

// middlewares
app.use(cors());
app.use(express.json());

// swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// routes
app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Blog API is healthy" });
});

// 404 handler — must come after all valid routes
app.use((_req: Request, res: Response<{ error: string }>) => {
  res.status(404).json({ error: "Route not found" });
});

// global error handler — must be registered last
app.use(globalErrorHandler);

// start server only after successfully connecting to the database
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 Docs are available at http://localhost:${PORT}/api-docs`);
    });

    // graceful shutdown — runs on Ctrl+C or when the process is killed
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("🛑 HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C
    process.on("SIGTERM", () => shutdown("SIGTERM"));  // e.g. Docker/Render/Heroku stop
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();