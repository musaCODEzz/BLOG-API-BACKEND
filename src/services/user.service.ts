import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createNewUser = async (name: string, email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new Error("User with this email already exists.");
    }

    // Hash the password (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
    });

    const savedUser = await newUser.save();
    const userObj = savedUser.toObject();
    delete (userObj as any).password;

    return userObj;
};

export const loginUser = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Select password field explicitly because of select: false in the schema
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    
    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid email or password.");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in environment variables.");
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });
    const { password: _password, ...userObj } = user.toObject();

    return { token, user: userObj };
};

export const fetchUserProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password ");
    return user;
}