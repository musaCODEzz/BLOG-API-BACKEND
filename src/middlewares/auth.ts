import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string; // Optional property to hold the user ID after decoding the token
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const token = header.slice("Bearer ".length); // note the trailing space — strips "Bearer " entirely, not just "Bearer"
        const secret = process.env["JWT_SECRET"] as string;

        if (!secret) {
            res.status(500).json({ message: "JWT secret missing" });
            return;
        }

        const payload = jwt.verify(token, secret) as { userId: string };
        req.userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

export default requireAuth;