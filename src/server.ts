import express from "express";
import type { Request, Response, Express } from "express";

const app: Express = express();
const PORT: number = 3000;

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello, World!" });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});