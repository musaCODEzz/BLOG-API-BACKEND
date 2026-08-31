import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { fetchAllBlogs, fetchBlogById, createNewBlog, updateBlogById, deleteBlogById } from "../services/blog.service.js";

// GET /api/blogs
export const getBlogs = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const allBlogs = await fetchAllBlogs();
        res.status(200).json(allBlogs);
    } catch (error) {
        next(error);
    }
};

// GET /api/blogs/:id
export const getBlogById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string;
        const blog = await fetchBlogById(blogId);

        if (!blog) {
            res.status(404).json({
                error: "Blog post not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }
        res.status(200).json(blog);
    } catch (error) {
        next(error);
    }
};

// POST /api/blogs
export const postBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, content } = req.body;
        const authorId = req.userId as string;

        const newBlog = await createNewBlog(title, content, authorId);
        res.status(201).json(newBlog);
    } catch (error) {
        next(error);
    }
};

// PUT /api/blogs/:id
export const putBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string;
        const { title, content } = req.body;
        const userId = req.userId as string;

        const updatedBlog = await updateBlogById(blogId, title, content, userId);
        if (!updatedBlog) {
            res.status(404).json({
                error: "Cannot update. Blog post not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }
        res.status(200).json(updatedBlog);
    } catch (error: any) {
        if (error.message === "Not authorized to modify this post.") {
            res.status(403).json({
                error: error.message,
                statusCode: 403,
                timestamp: new Date().toISOString()
            });
            return;
        }
        next(error);
    }
};

// DELETE /api/blogs/:id
export const deleteBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string;
        const userId = req.userId as string;

        const isDeleted = await deleteBlogById(blogId, userId);

        if (!isDeleted) {
            res.status(404).json({
                error: "Cannot delete. Blog post not found.",
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
            return;
        }
        res.status(200).json({ message: "Blog successfully deleted!" });
    } catch (error: any) {
        if (error.message === "Not authorized to modify this post.") {
            res.status(403).json({
                error: error.message,
                statusCode: 403,
                timestamp: new Date().toISOString()
            });
            return;
        }
        next(error);
    }
};