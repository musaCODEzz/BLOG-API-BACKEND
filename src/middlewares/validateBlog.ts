import type { Request, Response, NextFunction } from 'express';

export const validateBlogPost = (req: Request, res: Response, next: NextFunction): void => {
    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400).json({
            error: 'Validation Failed',
            message: 'Title and content are required fields.'
        });
        return;
    }

    if (title.trim() === '' || content.trim() === '') {
        res.status(400).json({
            error: 'Validation Failed',
            message: 'Title and content cannot be empty strings.'
        });
        return;
    }

    next();
};