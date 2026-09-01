import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

const isTestEnv = process.env.NODE_ENV === "test";

const passthrough = (_req: Request, _res: Response, next: NextFunction) => next();


export const authLimiter = isTestEnv
  ? passthrough
  : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        error: "Too many requests from this IP, please try again later.",
        statusCode: 429,
    },

});

// general limiter - for the whole app

export const generalLimiter = isTestEnv
  ? passthrough
  : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        error: "Too many requests from this IP, please try again later.",
        statusCode: 429,
    },
});