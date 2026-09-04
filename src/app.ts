import express from "express";
import type { Request, Response, Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { blogRouter } from "./routes/blog.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { mongoSanitizer } from "./middlewares/mongoSanitize.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";


const app: Express = express();

app.use(helmet({
    contentSecurityPolicy:false
}));
const allowedOrigin = process.env.ALLOWED_ORIGINS || "http://localhost:3000";

app.use(cors({
     origin: allowedOrigin,
     credentials: true,
}));
app.use(express.json());
app.use(mongoSanitizer);


// HTTP REQUEST LOGGER
app.use(morgan("dev")); // Logs HTTP requests to the console

// apply general rate limiter to all requests
app.use(generalLimiter);

// swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Redirect root URL to interactive Swagger documentation
app.get("/", (_req: Request, res: Response) => {
  res.redirect("/api-docs");
});

// routes
app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Blog API is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler — must come after all valid routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
});

// global error handler — must be registered last
app.use(globalErrorHandler);

export default app;
