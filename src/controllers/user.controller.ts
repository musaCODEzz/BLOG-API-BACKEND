import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { createNewUser, loginUser, fetchUserProfile } from "../services/user.service.js";
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
