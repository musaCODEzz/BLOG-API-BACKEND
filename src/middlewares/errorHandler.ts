import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("🚨 Server Error Caught:", err);

    const timestamp = new Date().toISOString();

    // 1. Mongoose invalid ObjectId error
    if (err.name === "CastError") {
        res.status(400).json({
            error: `Invalid ${err.path || "ID"}: ${err.value}`,
            statusCode: 400,
            timestamp
        });
        return;
    }

    // 2. Mongoose schema validation error
    if (err.name === "ValidationError") {
        const errorMessages = Object.values(err.errors || {}).map((e: any) => e.message).join(", ");
        res.status(400).json({
            error: errorMessages || "Validation Failed",
            statusCode: 400,
            timestamp
        });
        return;
    }

    // 3. MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        res.status(409).json({
            error: `A record with this ${field} already exists.`,
            statusCode: 409,
            timestamp
        });
        return;
    }

    // 4. JWT errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        res.status(401).json({
            error: "Unauthorized: Invalid or expired token",
            statusCode: 401,
            timestamp
        });
        return;
    }

    // 5. General / custom status errors
    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
    const errorMessage = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: errorMessage,
        statusCode,
        timestamp
    });
};