import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const createNewUser = async (name: string, email: string, password: string) => {

    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User with this email already exists.");
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword
    });

    return await newUser.save();
};


export const loginUser = async (email: string, password: string) => {

    const user = await User.findOne({ email }).select("+password"); // We need to select the password field explicitly because of select: false in the schema
    
    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid email or password.");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
    const { password: _password, ...userObj } = user.toObject(); // Remove password from the returned user object

    return { token, user: userObj };
}