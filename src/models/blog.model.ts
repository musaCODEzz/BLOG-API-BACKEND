// src/models/blog.model.ts
import { Schema, model, type Document, Types } from "mongoose";

// 1. The TypeScript Interface (This helps VS Code catch our typos)
export interface IBlogPost extends Document {
    title: string;
    content: string;
    author: Types.ObjectId; // This can be a reference to a User document or just a string
    likes: Types.ObjectId[];
    likesCount: number;
    tags: string[];
    views: number;
    readTime: string;
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
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            required: true
        },
        tags: {
            type: [String],
            default: [],
            index: true
        },
        views: {
            type: Number,
            default: 0,
            index: true
        },
        readTime: {
            type: String,
            default: "1 min read"
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        likesCount: {
            type: Number,
            default: 0,
            index: true
        }
    },
    {

        timestamps: true
    }
);

blogSchema.index({ title: "text", content: "text" }); // This allows for text search on title and content
const Blog = model<IBlogPost>("Blog", blogSchema);
export default Blog;