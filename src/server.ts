import express from "express";
import type { Request, Response, Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {blogRouter} from "./routes/blog.routes.js"; 
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

// load environment variables from .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;
// middlewares
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.use("/api/blogs", blogRouter);

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ message: "Blog API is healthy" });
});

app.use((req: Request, res: Response<{error: string}>) => {
    res.status(404).json({ error: "Route not found" });
});
app.use(globalErrorHandler)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Docs are available at http://localhost:${PORT}/api-docs`);
});

