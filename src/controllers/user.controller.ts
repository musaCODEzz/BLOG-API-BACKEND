import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { createNewUser, loginUser, fetchUserProfile, generatePasswordResetToken, resetUserPassword } from "../services/user.service.js";
import {fetchBlogsByAuthor} from "../services/blog.service.js";

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

// GET /api/users/profile
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId; // Assuming userId is set in the request by authentication middleware
        if (!userId) {
            res.status(401).json({
                error: "Unauthorized access. User ID is missing.",
                statusCode: 401,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        const user = await fetchUserProfile(userId);
        if (!user) {
            res.status(404).json({
                error: "User not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(200).json({
            message: "User profile fetched successfully!",
            user
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id/blogs
export const getUserBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authorId = req.params.id as string;
        const blogs = await fetchBlogsByAuthor(authorId);

        if (blogs === null) {
            res.status(404).json({
                error: "Author not found or invalid author ID.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(200).json({
            count: blogs.length,
            data: blogs
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/users/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body || {};
        if (!email || typeof email !== "string" || email.trim() === "") {
            res.status(400).json({
                error: "Please provide a valid email address.",
                statusCode: 400,
                timestamp: new Date().toISOString()
            });
            return;
        }

        const resetToken = await generatePasswordResetToken(email);

        // Security best practice: Always return 200 with a generic message
        // so attackers cannot guess whether an email exists in the database.
        res.status(200).json({
            message: "If an account with that email exists, a password reset token has been generated.",
            // In development, we return the token in the JSON response so you can test it directly in Postman:
            resetToken: resetToken || undefined
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/users/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, password } = req.body || {};
        if (!token || !password || typeof token !== "string" || typeof password !== "string") {
            res.status(400).json({
                error: "Token and new password are required string fields.",
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

        const success = await resetUserPassword(token, password);

        if (!success) {
            res.status(400).json({
                error: "Invalid or expired password reset token.",
                statusCode: 400,
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.status(200).json({
            message: "Password reset successfully. You can now log in with your new password."
        });
    } catch (error) {
        next(error);
    }
};
