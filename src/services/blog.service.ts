import { type BlogPost, blogs } from "../models/mockData.js";

export const getAllBlogPosts = (): BlogPost[] => {
    return blogs;
};

export const createBlogPost = (title: string, content: string, author: string): BlogPost => {
    const newBlog: BlogPost = {
        id: blogs.length + 1,
        title: title,
        content: content,
        author: author
    };
    blogs.push(newBlog);
    return newBlog;
};

export const updateBlogById = (id: number, title: string, content: string, author: string): BlogPost | null => {
    const blogIndex = blogs.findIndex(blog => blog.id === id);
    if (blogIndex === -1) {
        return null;
    }
    const updatedBlog: BlogPost = {
        id: id,
        title: title,
        content: content,
        author: author
    };
    blogs[blogIndex] = updatedBlog;
    return updatedBlog;
};

export const deleteBlogById = (id: number): boolean => {
    const blogIndex = blogs.findIndex(blog => blog.id === id);
    if (blogIndex === -1) {
        return false;
    }
    blogs.splice(blogIndex, 1);
    return true;
};

