import type { Response } from "express";
import { signSession } from "./token";
import { isProduction } from "../../../config/env";
import { SESSION_TTL_MS } from "../../constants/constants";

const COOKIE_NAME = "jwt";

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
} as const;

export const setAuthCookie = (res: Response, userId: string): void => {
    res.cookie(COOKIE_NAME, signSession(userId), {
        ...COOKIE_OPTIONS,
        maxAge: SESSION_TTL_MS,
    });
};

export const clearAuthCookie = (res: Response): void => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
};
