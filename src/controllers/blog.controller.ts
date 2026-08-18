import type {Request, Response} from "express";
import { getAllBlogPosts, createBlogPost, updateBlogById, deleteBlogById} from "../services/blog.service.js";

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

export const putBlog = (req: Request<{id: string}>, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const { title, content, author } = req.body;
    const updatedBlog = updateBlogById(id, title, content, author);
    if (updatedBlog) {
        res.status(200).json({message: "Blog updated successfully", blog: updatedBlog});
    } else {
        res.status(404).json({message: "Blog not found"});
    }
};

export const deleteBlog = (req: Request<{id: string}>, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    const isDeleted = deleteBlogById(id);
    if (isDeleted) {
        res.status(200).json({message: "Blog deleted successfully"});
    } else {
        res.status(404).json({message: "Blog not found"});
    }
};