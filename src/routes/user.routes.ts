import express, { type Router } from "express";
import { registerUser, login, getProfile, getUserBlogs } from "../controllers/user.controller.js";
import { validateUser } from "../middlewares/validateUser.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import requireAuth from "../middlewares/auth.js";


export const userRouter: Router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account. Requires name, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User with this email already exists
 *       429:
 *         description: Too many requests from this IP, please try again later.
 */
userRouter.post("/register", authLimiter, validateUser, registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token. Requires email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       429:
 *         description: Too many requests from this IP, please try again later.
 */
userRouter.post("/login", authLimiter, login);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile details of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 */
userRouter.get("/profile", requireAuth, getProfile);


/**
 * @swagger
 * /api/users/{id}/blogs:
 *   get:
 *     summary: Get all blogs by a specific author
 *     description: Retrieves all blog posts published by the specified user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the author
 *         example: "6a95c73eb65652f7138e98e2"
 *     responses:
 *       200:
 *         description: Author's blog posts retrieved successfully
 *       404:
 *         description: Author not found or invalid author ID
 */
userRouter.get("/:id/blogs", getUserBlogs);
