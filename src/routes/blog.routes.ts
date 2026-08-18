import express, {type Router} from "express";
import { getBlogs, postBlog, putBlog, deleteBlog} from "../controllers/blog.controller.js";
import { validateBlogPost } from "../middlewares/validateBlog.js";


export const blogRouter: Router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Retrieve a list of all blogs
 *     description: Fetches all blog posts currently stored in memory.
 *     responses:
 *       200:
 *         description: A list of blogs.
 */
blogRouter.get("/", getBlogs);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     description: Adds a new blog post. Requires title, content, and author.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Swagger Post"
 *               content:
 *                 type: string
 *                 example: "Testing the UI"
 *               author:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Blog created successfully.
 *       400:
 *         description: Validation failed (Missing fields).
 */
blogRouter.post("/", validateBlogPost, postBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update an existing blog post
 *     description: Modifies a blog post by its ID. Requires title, content, and author.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the blog to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Updated Title"
 *               content:
 *                 type: string
 *                 example: "This content was updated via Swagger!"
 *               author:
 *                 type: string
 *                 example: "Musa"
 *     responses:
 *       200:
 *         description: Blog updated successfully.
 *       400:
 *         description: Validation failed (Missing fields).
 *       404:
 *         description: Blog not found.
 */
blogRouter.put("/:id", validateBlogPost, putBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Permanently removes a blog post by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the blog to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog successfully deleted.
 *       404:
 *         description: Blog not found.
 */
blogRouter.delete("/:id", deleteBlog);