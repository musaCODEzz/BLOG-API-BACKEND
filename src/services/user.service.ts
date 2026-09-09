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
    
    if (!user || !user.password) {
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

    return { resetToken: rawResetToken, name: user.name };
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

// 5. GOOGLE OAUTH LOGIN — Verifies Google ID token, links or creates user, and returns JWT
export const googleAuthUser = async (credential: string) => {
    if (!credential || typeof credential !== "string") {
        throw new Error("Google credential token is required.");
    }

    // Verify token with Google's official tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);

    if (!response.ok) {
        throw new Error("Invalid or expired Google token.");
    }

    const payload = (await response.json()) as {
        aud?: string;
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
        email_verified?: boolean | string;
    };

    // Verify Google client ID if configured in .env
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
        throw new Error("Google token audience mismatch.");
    }

    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email) {
        throw new Error("Google account does not have an email address.");
    }

    if (email_verified === "false" || email_verified === false) {
        throw new Error("Google email is not verified.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find existing user by email or googleId
    let user = await User.findOne({ email: normalizedEmail });
    if (!user && googleId) {
        user = await User.findOne({ googleId });
    }

    if (user) {
        // Link googleId and avatar if not already set
        let updated = false;
        if (!user.googleId && googleId) {
            user.googleId = googleId;
            updated = true;
        }
        if (picture && !user.avatar) {
            user.avatar = picture;
            updated = true;
        }
        if (updated) {
            await user.save();
        }
    } else {
        // Create new user authenticated via Google
        user = new User({
            name: (name || "Google User").trim(),
            email: normalizedEmail,
            googleId,
            avatar: picture || "",
            authProvider: "google"
        });
        await user.save();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in environment variables.");
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });
    const userObj = user.toObject();
    delete (userObj as any).password;

    return { token, user: userObj };
};