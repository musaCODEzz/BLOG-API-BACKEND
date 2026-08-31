import type { Request, Response, NextFunction } from "express";
import { createNewUser, loginUser } from "../services/user.service.js";

// POST /api/users/register
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, username, email, password } = req.body;
        const displayName = name || username;

        const user = await createNewUser(displayName, email, password);
        
        // Return 201 with both top-level fields (PRD 5.3) and nested user object for full compatibility
        res.status(201).json({
            message: "User registered successfully!",
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            user
        });
    } catch (error: any) {
        if (error.message === "User with this email already exists.") {
            res.status(409).json({
                error: error.message,
                statusCode: 409,
                timestamp: new Date().toISOString()
            });
            return;
        }
        next(error);
    }
};

// POST /api/users/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            res.status(400).json({
                error: "Email and password are required fields.",
                statusCode: 400,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        const { token, user } = await loginUser(email, password);
        res.status(200).json({
            message: "Login successful!",
            token,
            user
        });
    } catch (error: any) {
        if (error.message === "Invalid email or password.") {
            res.status(401).json({
                error: error.message,
                statusCode: 401,
                timestamp: new Date().toISOString()
            });
            return;
        }
        next(error);
    }
};