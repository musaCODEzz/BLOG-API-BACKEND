import type { Request, Response, NextFunction } from "express";

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body || {};
    const name = body.name || body.username;
    const email = body.email;
    const password = body.password;

    if (!name || !email || !password || typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ 
            error: "Name, email, and password are required fields.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName === "" || trimmedEmail === "" || password.trim() === "") {
        res.status(400).json({ 
            error: "Name, email, and password cannot be empty strings.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        res.status(400).json({ 
            error: "Please enter a valid email address.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    if (password.length < 6) {
        res.status(400).json({ 
            error: "Password must be at least 6 characters long.",
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
        return;
    }

    req.body.name = trimmedName;
    req.body.email = trimmedEmail.toLowerCase();

    next();
};