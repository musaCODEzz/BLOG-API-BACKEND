import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { fetchAllBlogs, createNewBlog, updateBlogById, deleteBlogById } from "../services/blog.service.js";

export const getBlogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const allBlogs = await fetchAllBlogs();
        res.status(200).json(allBlogs);
    } catch (error) {
        next(error); // Sends errors to our Global Error Handler!
    }
};

export const postBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, content } = req.body;
        const authorId = req.userId as string; // set by requireAuth — safe to assume it exists here

        const newBlog = await createNewBlog(title, content, authorId);
        res.status(201).json({ message: "Blog created successfully!", blog: newBlog });
    } catch (error) {
        next(error);
    }
};

export const putBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string;
        const { title, content } = req.body;
        const userId = req.userId as string;

        const updatedBlog = await updateBlogById(blogId, title, content, userId);
        if (!updatedBlog) {
            res.status(404).json({ error: "Cannot update. Blog post not found!" });
            return;
        }
        res.status(200).json({ message: "Blog updated successfully!", blog: updatedBlog });
    } catch (error: any) {
        if (error.message === "Not authorized to modify this post.") {
            res.status(403).json({ error: error.message });
            return;
        }
        next(error);
    }
};

export const deleteBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string;
        const userId = req.userId as string;

        const isDeleted = await deleteBlogById(blogId, userId);

        if (!isDeleted) {
            res.status(404).json({ error: "Cannot delete. Blog post not found!" });
            return;
        }
        res.status(200).json({ message: "Blog successfully deleted!" });
    } catch (error: any) {
        if (error.message === "Not authorized to modify this post.") {
            res.status(403).json({ error: error.message });
            return;
        }
        next(error);
    }
};