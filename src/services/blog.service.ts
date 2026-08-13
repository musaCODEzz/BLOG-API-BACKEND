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


