import { Schema, model, type Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false // This ensures that the password is not returned in queries by default
        },
        resetPasswordToken: {
            type: String,
            select: false // This ensures that the resetPasswordToken is not returned in queries by default
        },
        resetPasswordExpires: {
            type: Date,
            select: false // This ensures that the resetPasswordExpires is not returned in queries by default
        }

    },
    {
        timestamps: true
    }
);

const User = model<IUser>('User', UserSchema);

export default User;