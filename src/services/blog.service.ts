import mongoose from "mongoose";
import Blog from "../models/blog.model.js";

export interface FetchBlogsOptions {
    page: number;
    limit: number;
    search?: string | undefined;
    sort?: string | undefined;
}

// 1. GET ALL — Populates author details, supports pagination, search, and dynamic sorting
export const fetchAllBlogs = async ({ page, limit, search, sort = "-createdAt" }: FetchBlogsOptions) => {
    const filter: Record<string, unknown> = {};
    if (search && search.trim() !== "") {
        filter.$text = { $search: search.trim() };
    }
    const skip = (page - 1) * limit;

    // Handle sort parameter (e.g. "-createdAt", "createdAt", "-title", "title")
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort) {
        const isDescending = sort.startsWith("-");
        const fieldName = isDescending ? sort.substring(1) : sort;
        const allowedSortFields = ["createdAt", "title", "updatedAt"];
        if (allowedSortFields.includes(fieldName)) {
            sortOption = { [fieldName]: isDescending ? -1 : 1 };
        }
    }

    const [blogs, totalResults] = await Promise.all([
        Blog.find(filter)
            .populate("author", "name email")
            .skip(skip)
            .limit(limit)
            .sort(sortOption),
        Blog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalResults / limit) || 1;

    return {
        blogs,
        pagination: {
            total: totalResults,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
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

// 6. GET BLOGS BY AUTHOR — Fetches all posts written by a specific user ID
export const fetchBlogsByAuthor = async (authorId: string) => {
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return null;
    }
    const blogs = await Blog.find({ author: authorId })
        .populate("author", "name email")
        .sort({ createdAt: -1 });
    return blogs;
};