// src/models/blog.model.ts
import { Schema, model, type Document } from "mongoose";

// 1. The TypeScript Interface (This helps VS Code catch our typos)
export interface IBlogPost extends Document {
    title: string;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt: Date; 
}

// 2. The Mongoose Schema (This protects the database while the server is running)
const blogSchema = new Schema<IBlogPost>(
    {
        title: { 
            type: String, 
            required: [true, "A blog post must have a title"],
            trim: true // Automatically cuts off empty spaces like "  Hello  " -> "Hello"
        },
        content: { 
            type: String, 
            required: [true, "Content cannot be empty"] 
        },
        author: { 
            type: String, 
            required: true 
        }
    },
    {
        
        timestamps: true 
    }
);

const Blog = model<IBlogPost>("Blog", blogSchema);
export default Blog;