import Blog from "../models/blog.model.js";

// 1. GET ALL
export const fetchAllBlogs = async () => {
    return await Blog.find();
};

// 2. CREATE
// `authorId` is the logged-in user's ID (from req.userId), not a free-text name
export const createNewBlog = async (title: string, content: string, authorId: string) => {
    return await Blog.create({ title, content, author: authorId });
};

// 3. UPDATE — only the original author may update their own post
export const updateBlogById = async (id: string, title: string, content: string, userId: string) => {
    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
        return null; // controller turns this into a 404
    }

    if (existingBlog.author.toString() !== userId) {
        throw new Error("Not authorized to modify this post.");
    }

    // { new: true } tells Mongoose to return the newly updated data, not the old version
    return await Blog.findByIdAndUpdate(id, { title, content }, { new: true });
};

// 4. DELETE — only the original author may delete their own post
export const deleteBlogById = async (id: string, userId: string): Promise<boolean> => {
    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
        return false; // controller turns this into a 404
    }

    if (existingBlog.author.toString() !== userId) {
        throw new Error("Not authorized to modify this post.");
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);
    return deletedBlog !== null;
};