import mongoose from "mongoose";
import Blog from "../models/blog.model.js";

// 1. GET ALL — Populates author details as required by PRD 5.3
export const fetchAllBlogs = async () => {
    return await Blog.find().populate("author", "name email");
};

// 2. GET BY ID — Fetches a single blog post with populated author details
export const fetchBlogById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    return await Blog.findById(id).populate("author", "name email");
};

// 3. CREATE
export const createNewBlog = async (title: string, content: string, authorId: string) => {
    return await Blog.create({ title, content, author: authorId });
};

// 4. UPDATE — only the original author may update their own post
export const updateBlogById = async (id: string, title: string, content: string, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
        return null; // controller turns this into a 404
    }

    const postAuthorId = existingBlog.author?._id
        ? existingBlog.author._id.toString()
        : existingBlog.author?.toString();

    if (postAuthorId !== userId) {
        throw new Error("Not authorized to modify this post.");
    }

    // returnDocument: 'after' tells Mongoose to return the newly updated data
    return await Blog.findByIdAndUpdate(id, { title, content }, { returnDocument: "after" });
};


// 5. DELETE — only the original author may delete their own post
export const deleteBlogById = async (id: string, userId: string): Promise<boolean> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
    }

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
        return false; // controller turns this into a 404
    }

    const postAuthorId = existingBlog.author?._id
        ? existingBlog.author._id.toString()
        : existingBlog.author?.toString();

    if (postAuthorId !== userId) {
        throw new Error("Not authorized to modify this post.");
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);
    return deletedBlog !== null;
};