import type { Request, Response, NextFunction } from "express";

export const validateBlogPost = (req: Request, res: Response, next: NextFunction): void => {
    const { title, content } = req.body || {};

    if (!title || !content || typeof title !== "string" || typeof content !== "string") {
        res.status(400).json({
            error: "Title and content are required string fields.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    if (title.trim() === "" || content.trim() === "") {
        res.status(400).json({
            error: "Title and content cannot be empty strings.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    req.body.title = title.trim();
    req.body.content = content.trim();

    next();
};