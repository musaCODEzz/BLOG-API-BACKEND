import type {Request, Response, NextFunction} from 'express';

export const validateBlogPost  = (req: Request, res: Response, next: NextFunction): void => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
        res.status(400).json({ 
            error: 'Validation Failed',
            message: 'Title, content, and author are required fields.'
        });
        return;
    }
    if (title.trim() === '' || content.trim() === '' || author.trim() === '') {
        res.status(400).json({ 
            error: 'Validation Failed',
            message: 'Title, content, and author cannot be empty strings.'
        });
        return;
    }
    next();

}

