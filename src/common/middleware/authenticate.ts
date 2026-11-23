import type { Request, RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { UnauthorizedError } from "../error/errorStatusCode";
import { verifySession } from "../utils/auth/token";

// Body/query are `any` so `authenticate` composes with `validate(...)` handlers
// whose req.body / req.query are typed from a schema.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const authenticate: RequestHandler<ParamsDictionary, any, any, any> = (
    req,
    _res,
    next,
) => {
    const token = (
        (req as Request).cookies as Record<string, string | undefined>
    ).jwt;

    if (!token) {
        return next(new UnauthorizedError("Not authenticated"));
    }

    try {
        req.user = { id: verifySession(token) };
        next();
    } catch (error) {
        next(error);
    }
};
/* eslint-enable @typescript-eslint/no-explicit-any */
