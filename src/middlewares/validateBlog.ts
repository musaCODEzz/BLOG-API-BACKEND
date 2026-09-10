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

    // Sanitize and normalize tags if provided (accepts string[] or comma-separated string)
    if (req.body.tags !== undefined) {
        if (Array.isArray(req.body.tags)) {
            req.body.tags = Array.from(
                new Set(
                    req.body.tags
                        .filter((t: unknown) => typeof t === "string")
                        .map((t: string) => t.trim().toLowerCase())
                        .filter((t: string) => t.length > 0)
                )
            );
        } else if (typeof req.body.tags === "string") {
            req.body.tags = Array.from(
                new Set(
                    req.body.tags
                        .split(",")
                        .map((t: string) => t.trim().toLowerCase())
                        .filter((t: string) => t.length > 0)
                )
            );
        } else {
            req.body.tags = [];
        }
    }

    next();
};