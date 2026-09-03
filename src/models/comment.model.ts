import { Schema, model, type Document, Types } from 'mongoose';

export interface IComment extends Document {
    content: string;
    blog: Types.ObjectId; // Reference to the Blog model
    author: Types.ObjectId; // Reference to the User model
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: [true, 'Comment cannot be empty'],
            trim: true
        },
        blog: {
            type: Schema.Types.ObjectId,
            ref: 'Blog',
            required: [true, 'Comment must be associated with a blog post']
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Comment must have an author'],
            index: true // Indexing for faster queries on author
        }
    },
    {
        timestamps: true
    }
);

// Compound index for fast retrieval of comments per blog sorted by newest
commentSchema.index({ blog: 1, createdAt: -1 });

const Comment = model<IComment>('Comment', commentSchema);

export default Comment;