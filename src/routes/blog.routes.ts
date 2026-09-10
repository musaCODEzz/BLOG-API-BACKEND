import express, { type Router } from "express";
import { getBlogs, getBlogById, postBlog, putBlog, deleteBlog, likeBlog, getPopularTags } from "../controllers/blog.controller.js";
import { validateBlogPost } from "../middlewares/validateBlog.js";
import { requireAuth } from "../middlewares/auth.js";
import { commentRouter } from "./comment.routes.js";

export const blogRouter: Router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Retrieve a paginated list of blogs
 *     description: Fetches blog posts with pagination and optional text search across title and content. Public endpoint — no authentication required.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number to retrieve (defaults to 1)
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of results per page (defaults to 10)
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         required: false
 *         description: Text search term matched against blog title and content
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         required: false
 *         description: Field to sort by (prefix with '-' for descending, e.g. '-createdAt', 'createdAt', '-title', '-likesCount')
 *         schema:
 *           type: string
 *           default: "-createdAt"
 *       - in: query
 *         name: tag
 *         required: false
 *         description: Filter blogs by tag (e.g. 'typescript', 'docker', 'react')
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A paginated list of blogs.
 */
blogRouter.get("/", getBlogs);

/**
 * @swagger
 * /api/blogs/tags:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Retrieve popular tags
 *     description: Aggregates all tags across articles and returns them sorted by usage frequency with article counts.
 *     security: []
 *     responses:
 *       200:
 *         description: Popular tags retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tag:
 *                         type: string
 *                         example: "typescript"
 *                       count:
 *                         type: integer
 *                         example: 5
 */
blogRouter.get("/tags", getPopularTags);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Retrieve a single blog post
 *     description: Fetches a blog post by its ID. Public endpoint — no authentication required.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully.
 *       404:
 *         description: Blog post not found.
 */
blogRouter.get("/:id", getBlogById);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     tags:
 *       - Blogs
 *     summary: Create a new blog post
 *     description: Adds a new blog post. Requires authentication (Authorize 🔓 with token) — author is set automatically from token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Swagger Post"
 *               content:
 *                 type: string
 *                 example: "Testing the UI"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["typescript", "docker"]
 *     responses:
 *       201:
 *         description: Blog created successfully.
 *       400:
 *         description: Validation failed (Missing fields).
 *       401:
 *         description: Unauthorized — missing or invalid token.
 */
blogRouter.post("/", requireAuth, validateBlogPost, postBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     tags:
 *       - Blogs
 *     summary: Update an existing blog post
 *     description: Modifies a blog post by its ID. Requires authentication (Authorize 🔓 with token) — only the original author may update.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Updated Title"
 *               content:
 *                 type: string
 *                 example: "This content was updated via Swagger!"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["typescript", "react"]
 *     responses:
 *       200:
 *         description: Blog updated successfully.
 *       400:
 *         description: Validation failed (Missing fields).
 *       401:
 *         description: Unauthorized — missing or invalid token.
 *       403:
 *         description: Forbidden — you are not the author of this post.
 *       404:
 *         description: Blog not found.
 */
blogRouter.put("/:id", requireAuth, validateBlogPost, putBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     tags:
 *       - Blogs
 *     summary: Delete a blog post
 *     description: Permanently removes a blog post by its ID. Requires authentication (Authorize 🔓 with token) — only original author may delete.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog successfully deleted.
 *       401:
 *         description: Unauthorized — missing or invalid token.
 *       403:
 *         description: Forbidden — you are not the author of this post.
 *       404:
 *         description: Blog not found.
 */
blogRouter.delete("/:id", requireAuth, deleteBlog);

/**
 * @swagger
 * /api/blogs/{id}/like:
 *   post:
 *     tags:
 *       - Blogs
 *     summary: Toggle like on a blog post
 *     description: Toggles like/unlike on a blog post for the authenticated user. Returns whether the post is currently liked by the caller and the total likesCount.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog post to like/unlike
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blog post liked successfully."
 *                 isLiked:
 *                   type: boolean
 *                   example: true
 *                 likesCount:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized — missing or invalid token.
 *       404:
 *         description: Blog not found.
 */
blogRouter.post("/:id/like", requireAuth, likeBlog);

blogRouter.use("/:blogId/comments", commentRouter);