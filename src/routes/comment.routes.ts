// src/routes/comment.routes.ts
import express, { type Router } from "express";
import { getComments, postComment, deleteComment } from "../controllers/comment.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateComment } from "../middlewares/validateComment.js";

// mergeParams: true ensures req.params.blogId is passed down from the parent router
export const commentRouter: Router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/blogs/{blogId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Retrieve comments for a blog post
 *     description: Fetches all comments associated with a specific blog post in reverse chronological order. Public endpoint.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog post
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments successfully retrieved.
 *       404:
 *         description: Blog post not found.
 */
commentRouter.get("/", getComments);

/**
 * @swagger
 * /api/blogs/{blogId}/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Add a comment to a blog post
 *     description: Creates a new comment under a specific blog post. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog post to comment on
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great article! Really helped me understand the topic."
 *     responses:
 *       201:
 *         description: Comment created successfully.
 *       400:
 *         description: Validation error or invalid blog ID format.
 *       401:
 *         description: Unauthorized - missing or invalid token.
 *       404:
 *         description: Blog post not found.
 */
commentRouter.post("/", requireAuth, validateComment, postComment);

/**
 * @swagger
 * /api/blogs/{blogId}/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Removes a comment. Only the author of the comment is authorized to delete it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog post
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       401:
 *         description: Unauthorized - missing or invalid token.
 *       403:
 *         description: Forbidden - not authorized to delete this comment.
 *       404:
 *         description: Comment not found.
 */
commentRouter.delete("/:commentId", requireAuth, deleteComment);

