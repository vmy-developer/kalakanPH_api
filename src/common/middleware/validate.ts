import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodType, z } from "zod";

type Source = "body" | "query" | "params";

/**
 * Validates `req[source]` and replaces it with the parsed output. The handler
 * is typed with the schema's output, so controllers declared as
 * `Request<ParamsDictionary, unknown, RegisterData>` need no `as` casts and
 * a schema/controller mismatch fails to compile.
 */
export function validate<S extends ZodType>(
    schema: S,
    source?: "body",
): RequestHandler<ParamsDictionary, unknown, z.output<S>>;
export function validate<S extends ZodType>(
    schema: S,
    source: "query",
): RequestHandler<ParamsDictionary, unknown, unknown, z.output<S>>;
export function validate<S extends ZodType>(
    schema: S,
    source: "params",
): RequestHandler<z.output<S>>;
export function validate(schema: ZodType, source: Source = "body") {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) return next(result.error);

        if (source === "body") {
            req.body = result.data;
        } else {
            Object.defineProperty(req, source, {
                value: result.data,
                writable: true,
                configurable: true,
            });
        }
        next();
    };
}
