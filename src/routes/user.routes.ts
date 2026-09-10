import express, { type Router } from "express";
import { registerUser, login, getProfile, putProfile, getUserBookmarks, getUserBlogs, forgotPassword, resetPassword, googleLogin } from "../controllers/user.controller.js";
import { validateUser } from "../middlewares/validateUser.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import requireAuth from "../middlewares/auth.js";


export const userRouter: Router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
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
 *     tags:
 *       - Users
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token. Copy the 'token' string from the response to authorize protected endpoints.
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
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieves the profile details of the currently authenticated user. Requires a valid JWT token (Authorize 🔓 with token).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         description: User not found
 */
userRouter.get("/profile", requireAuth, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     description: Modifies bio, avatar, social handles (website, github, twitter), name, and optionally changes the password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               bio:
 *                 type: string
 *                 example: "Staff Software Engineer building resilient microservices."
 *               avatar:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
 *               website:
 *                 type: string
 *                 example: "https://janedoe.dev"
 *               github:
 *                 type: string
 *                 example: "janedoe"
 *               twitter:
 *                 type: string
 *                 example: "janedoe_dev"
 *               oldPassword:
 *                 type: string
 *                 example: "password123"
 *               newPassword:
 *                 type: string
 *                 example: "newStrongPassword123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid password or validation error
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         description: User not found
 */
userRouter.put("/profile", requireAuth, putProfile);

/**
 * @swagger
 * /api/users/bookmarks:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get caller's saved bookmarks
 *     description: Retrieves the authenticated user's bookmarked blog posts with pagination and populated author details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Saved bookmarks retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */
userRouter.get("/bookmarks", requireAuth, getUserBookmarks);


/**
 * @swagger
 * /api/users/{id}/blogs:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all blogs by a specific author
 *     description: Retrieves all public blog posts published by the specified author ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the author
 *         example: "6a95bba75d5f661bef750f0e"
 *     responses:
 *       200:
 *         description: Author's blog posts retrieved successfully
 *       404:
 *         description: Author not found or invalid author ID
 */
userRouter.get("/:id/blogs", getUserBlogs);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Request a password reset token
 *     description: Generates a time-limited (15 min) password reset token for the specified email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Reset token generated
 *       400:
 *         description: Invalid email provided
 *       429:
 *         description: Too many requests
 */
userRouter.post("/forgot-password", authLimiter, forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Reset password using token
 *     description: Sets a new password using a valid, unexpired reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: The raw reset token received from forgot-password
 *               password:
 *                 type: string
 *                 example: "brandNewPassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token, or invalid password
 *       429:
 *         description: Too many requests
 */
userRouter.post("/reset-password", authLimiter, resetPassword);

/**
 * @swagger
 * /api/users/google-login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Google OAuth Sign-In / Registration
 *     description: Authenticates or registers a user via a verified Google ID token (credential). Returns a standard JWT token and user profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: The Google ID token (credential) returned by Google Identity Services on the frontend
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI..."
 *     responses:
 *       200:
 *         description: Google login successful
 *       400:
 *         description: Google credential token is required
 *       401:
 *         description: Invalid, expired, or unverified Google token
 *       429:
 *         description: Too many requests from this IP
 */
userRouter.post("/google-login", authLimiter, googleLogin);

