import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({

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

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        error: "Too many requests from this IP, please try again later.",
        statusCode: 429,
    },
});