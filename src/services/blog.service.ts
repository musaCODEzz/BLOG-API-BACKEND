// src/services/blog.service.ts
import Blog from "../models/blog.model.js";

// 1. GET ALL
export const fetchAllBlogs = async () => {
    return await Blog.find();
};

// 2. CREATE
export const createNewBlog = async (title: string, content: string, author: string) => {
    return await Blog.create({ title, content, author });
};

// 3. UPDATE
export const updateBlogById = async (id: string, title: string, content: string, author: string) => {
    // { new: true } tells Mongoose to return the newly updated data, not the old version
    return await Blog.findByIdAndUpdate(id, { title, content, author }, { new: true });
};

// 4. DELETE
export const deleteBlogById = async (id: string): Promise<boolean> => {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    return deletedBlog !== null; // Returns true if it found and deleted it
};