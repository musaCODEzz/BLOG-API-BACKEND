import type { Request, Response, NextFunction } from "express";

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ 
            error: 'Validation Failed',
            message: 'Name, email, and password are required fields.'
        });
        return;
    }

    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
        res.status(400).json({ 
            error: 'Validation Failed',
            message: 'Name, email, and password cannot be empty strings.'
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ 
            error: "Validation Failed",
            message: "Please enter a valid email address." 
        });
        return;
    }


    if (password.length < 6) {
        res.status(400).json({ 
            error: "Validation Failed",
            message: "Password must be at least 6 characters long." 
        });
        return;
    }
    next();
};