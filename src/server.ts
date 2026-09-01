import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";

// load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 8000;



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