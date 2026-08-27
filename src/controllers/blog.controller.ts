// src/controllers/blog.controller.ts
import type { Request, Response, NextFunction } from "express";
import { fetchAllBlogs, createNewBlog, updateBlogById, deleteBlogById } from "../services/blog.service.js";

export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const allBlogs = await fetchAllBlogs();
        res.status(200).json(allBlogs);
    } catch (error) {
        next(error); // Sends errors to our Global Error Handler!
    }
};

export const postBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, content, author } = req.body;
        const newBlog = await createNewBlog(title, content, author);
        res.status(201).json({ message: "Blog created successfully!", blog: newBlog });
    } catch (error) {
        next(error);
    }
};

export const putBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string; // Removed parseInt!
        const { title, content, author } = req.body;
        
        const updatedBlog = await updateBlogById(blogId, title, content, author);
        if (!updatedBlog) {
            res.status(404).json({ error: "Cannot update. Blog post not found!" });
            return;
        }
        res.status(200).json({ message: "Blog updated successfully!", blog: updatedBlog });
    } catch (error) {
        next(error);
    }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogId = req.params.id as string; // Removed parseInt!
        const isDeleted = await deleteBlogById(blogId);

        if (!isDeleted) {
            res.status(404).json({ error: "Cannot delete. Blog post not found!" });
            return;
        }
        res.status(200).json({ message: "Blog successfully deleted!" });
    } catch (error) {
        next(error);
    }
};