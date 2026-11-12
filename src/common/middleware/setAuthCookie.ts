import dotenv from "dotenv";
dotenv.config({ quiet: true });

import jwt from "jsonwebtoken";
import type { Response } from "express";
import { NotFoundError } from "../error/errorStatusCode";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new NotFoundError("JWT_SECRET is not defined");
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
} as const;

export const setAuthCookie = (res: Response, userId: string): void => {
    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "1d",
    });

    res.cookie("jwt", token, {
        ...COOKIE_OPTIONS,
        maxAge: ONE_DAY_MS,
    });
};

export const clearAuthCookie = (res: Response): void => {
    res.clearCookie("jwt", COOKIE_OPTIONS);
};
