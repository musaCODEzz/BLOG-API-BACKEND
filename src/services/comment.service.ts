// src/services/comment.service.ts
import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Blog from "../models/blog.model.js";

// 1. Fetch all comments for a blog post
export const fetchCommentsByBlogId = async (blogId: string) => {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return null;
    }

    // Verify the blog exists
    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
        return null;
    }

    return await Comment.find({ blog: blogId })
        .populate("author", "name email")
        .sort({ createdAt: -1 });
};

// 2. Add a comment to a blog post
export const createComment = async (blogId: string, authorId: string, content: string) => {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return null;
    }

    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
        return null;
    }

    const comment = await Comment.create({
        content,
        blog: new mongoose.Types.ObjectId(blogId),
        author: new mongoose.Types.ObjectId(authorId)
    });

    return await comment.populate("author", "name email");
};

// 3. Delete a comment (Author-only enforcement)
export const deleteCommentById = async (commentId: string, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return { status: "NOT_FOUND" as const };
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return { status: "NOT_FOUND" as const };
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
        return { status: "FORBIDDEN" as const };
    }

    await Comment.findByIdAndDelete(commentId);
    return { status: "DELETED" as const };
};
