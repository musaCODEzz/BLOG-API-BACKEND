import type {Request, Response} from "express";
import { getAllBlogPosts, createBlogPost } from "../services/blog.service.js";

export type CreateBlogBody = {
    title: string;
    content: string;
    author: string;

}
// Handle get request
export const getBlogs = (req: Request, res: Response): void => {
    const blogs = getAllBlogPosts();
    res.status(200).json(blogs);

}

// handle post request
export const postBlog = (req: Request<{}, {}, CreateBlogBody>, res: Response): void => {
    const { title, content, author } = req.body;
    const newBlog = createBlogPost(title, content, author);
    res.status(201).json({message: "Blog created successfully", blog: newBlog});
};