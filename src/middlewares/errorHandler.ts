import type {Request, Response, NextFunction} from "express";

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error("🚨 Server Error Caught:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Something went wrong on our end. Please try again later."});
};