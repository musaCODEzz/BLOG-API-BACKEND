import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const validateComment = (req: Request, res: Response, next: NextFunction): void => {

    const { content } = req.body || {};
    const blogId = req.params.blogId as string | undefined;

    if (blogId && !mongoose.Types.ObjectId.isValid(blogId)) {
        res.status(400).json({
            error: "Invalid blog ID format.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
        res.status(400).json({
            error: "Comment content is required and cannot be empty.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    req.body.content = content.trim();
    next();
};