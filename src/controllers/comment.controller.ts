// src/controllers/comment.controller.ts
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { fetchCommentsByBlogId, createComment, deleteCommentById } from "../services/comment.service.js";

// GET /api/blogs/:blogId/comments
export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { blogId } = req.params;
        const comments = await fetchCommentsByBlogId(blogId as string);

        if (!comments) {
            res.status(404).json({
                error: "Blog post not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(200).json({ data: comments, count: comments.length });
    } catch (error) {
        next(error);
    }
};

// POST /api/blogs/:blogId/comments
export const postComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;
        const authorId = req.userId as string;

        const comment = await createComment(blogId as string, authorId, content);

        if (!comment) {
            res.status(404).json({
                error: "Blog post not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/blogs/:blogId/comments/:commentId
export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { commentId } = req.params;
        const userId = req.userId as string;

        const result = await deleteCommentById(commentId as string, userId);

        if (result.status === "NOT_FOUND") {
            res.status(404).json({
                error: "Comment not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }

        if (result.status === "FORBIDDEN") {
            res.status(403).json({
                error: "Not authorized to delete this comment.",
                statusCode: 403,
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        next(error);
    }
};
