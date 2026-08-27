import type {Request, Response, NextFunction} from "express";
import { createNewUser, loginUser } from "../services/user.service.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const newUser = await createNewUser(name, email, password);
        res.status(201).json({ message: "User registered successfully!", user: newUser });
    }catch (error: any) {
        if(error.message === "User with this email already exists.") {
            res.status(409).json({ error: error.message });
            return;
        }
        next(error); // Sends errors to our Global Error Handler!
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        
        const { token, user } = await loginUser(email, password);
        res.status(200).json({ message: "Login successful!", token, user });
    }catch (error: any) {
        if(error.message === "Invalid email or password.") {
            res.status(401).json({ error: error.message });
            return;
        }
        next(error); // Sends errors to our Global Error Handler!
    }
};