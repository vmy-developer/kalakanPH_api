import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../error/errorStatusCode";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

interface TokenPayload {
    userId: string;
}

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const token = (req.cookies as Record<string, string | undefined>).jwt;

    if (!token) {
        return next(new UnauthorizedError("Not authenticated"));
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
        req.user = { id: payload.userId };
        next();
    } catch {
        next(new UnauthorizedError("Invalid or expired session"));
    }
};
