import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";


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

// 3. FORGOT PASSWORD — Generates a 15-minute cryptographically secure reset token
export const generatePasswordResetToken = async (email: string) => {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        return null; // No user found with this email
    }
    // 1. Generate 32 bytes of random hex (e.g. 64 characters)
    const rawResetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash it with SHA-256 before storing in the database
    const hashedToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    // 3. Set expiry to 15 minutes from now
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await user.save();

    return rawResetToken; // Return the raw token to be sent via email
};

// 4. RESET PASSWORD — Validates token, hashes new password, and invalidates token
export const resetUserPassword = async (token: string, newPassword: string) => {
    // Hash incoming raw token to compare with what is in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired yet
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() } // Token must not be expired
    }).select("+password +resetPasswordToken +resetPasswordExpires");
    
    if (!user) {
        return false; // Invalid or expired token
    }

    // Hash the new password with bcrypt
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user's password and invalidate the reset token
    user.password = hashedNewPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return true; // Password reset successful
};