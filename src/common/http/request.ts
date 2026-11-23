import type { Request } from "express";
import { UnauthorizedError } from "../error/errorStatusCode";

/** Id of the authenticated user. Only valid behind the `authenticate` middleware. */
export const getUserId = (req: Pick<Request, "user">): string => {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    return req.user.id;
};
