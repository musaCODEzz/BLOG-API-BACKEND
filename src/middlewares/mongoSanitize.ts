import type { Request, Response, NextFunction } from "express";

/**
 * Recursively sanitizes an object or array by removing keys that start with '$' or contain '.'
 * to prevent MongoDB query selector / operator injection attacks.
 */
function sanitize(target: unknown): unknown {
  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      target[i] = sanitize(target[i]);
    }
    return target;
  }

  if (target !== null && typeof target === "object") {
    const obj = target as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  }

  return target;
}

/**
 * Global Express middleware to sanitize req.body, req.params, and req.query
 * against MongoDB NoSQL injection attacks.
 */
export const mongoSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    sanitize(req.body);
  }
  if (req.params) {
    sanitize(req.params);
  }
  if (req.query) {
    sanitize(req.query);
  }
  next();
};
