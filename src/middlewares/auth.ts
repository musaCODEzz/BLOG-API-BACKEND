import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.match(/^Bearer\s+/i)) {
            res.status(401).json({ 
                error: "Unauthorized: Missing or invalid Authorization header.",
                statusCode: 401,
                timestamp: new Date().toISOString()
            });
            return;
        }

        const token = header.replace(/^Bearer\s+/i, "").trim();
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            res.status(500).json({ 
                error: "Internal Server Error: JWT secret missing.",
                statusCode: 500,
                timestamp: new Date().toISOString()
            });
            return;
        }

        const payload = jwt.verify(token, secret) as { userId?: string; id?: string; sub?: string };
        const userId = payload.userId || payload.id || payload.sub;

        if (!userId) {
            res.status(401).json({ 
                error: "Unauthorized: Token payload is missing user identification.",
                statusCode: 401,
                timestamp: new Date().toISOString()
            });
            return;
        }

        req.userId = String(userId);
        next();
    } catch (error: any) {
        res.status(401).json({ 
            error: "Unauthorized: Invalid or expired token.",
            statusCode: 401,
            timestamp: new Date().toISOString()
        });
        return;
    }
};

export default requireAuth;