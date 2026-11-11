import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../error/errorStatusCode";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: err.issues[0]?.message ?? "Validation failed",
            errors: z.flattenError(err).fieldErrors,
        });
    }

    if (err instanceof AppError) {
        return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
}
