import express, { type Router } from "express";
import { getBlogs, getBlogById, postBlog, putBlog, deleteBlog } from "../controllers/blog.controller.js";
import { validateBlogPost } from "../middlewares/validateBlog.js";
import { requireAuth } from "../middlewares/auth.js";

export const blogRouter: Router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
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
 *         description: Field to sort by (prefix with '-' for descending, e.g. '-createdAt', 'createdAt', '-title')
 *         schema:
 *           type: string
 *           default: "-createdAt"
 *     responses:
 *       200:
 *         description: A paginated list of blogs.
 */
blogRouter.get("/", getBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
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
 *     summary: Create a new blog post
 *     description: Adds a new blog post. Requires authentication — the author is set automatically from the logged-in user's token.
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
 *     summary: Update an existing blog post
 *     description: Modifies a blog post by its ID. Requires authentication — only the original author may update their own post.
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
 *     summary: Delete a blog post
 *     description: Permanently removes a blog post by its ID. Requires authentication — only the original author may delete their own post.
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