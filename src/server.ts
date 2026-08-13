import express from "express";
import type { Request, Response, Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {blogRouter} from "./routes/blog.routes.js"; 

// load environment variables from .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT;
// middlewares
app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRouter);

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ message: "Blog API is healthy" });
});

app.use((req: Request, res: Response<{error: string}>) => {
    res.status(404).json({ error: "Route not found" });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

