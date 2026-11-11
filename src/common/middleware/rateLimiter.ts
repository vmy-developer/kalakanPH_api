import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "../../config/redis";

type RedisClient = typeof redis;

interface LimiterOptions {
    windowMs: number;
    limit: number;
    byEmail?: boolean;
    skipSuccessfulRequests?: boolean;
    byUser?: boolean;
}

export function createLimiters(client: RedisClient) {
    const make = (name: string, opts: LimiterOptions) =>
        rateLimit({
            windowMs: opts.windowMs,
            limit: opts.limit,
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: opts.skipSuccessfulRequests ?? false,
            passOnStoreError: true,

            store: new RedisStore({
                prefix: `rl:identity:${name}:`,
                sendCommand: (...args: string[]) =>
                    client.sendCommand<RedisReply>(args),
            }),

            keyGenerator: (req) => {
                if (opts.byUser && req.user) {
                    return `user:${req.user.id}`;
                }

                const ip = ipKeyGenerator(req.ip ?? "");

                const body: unknown = req.body;

                const email =
                    typeof body === "object" && body !== null && "email" in body
                        ? body.email
                        : undefined;

                return opts.byEmail && typeof email === "string"
                    ? `${ip}:${email.trim().toLowerCase()}`
                    : ip;
            },

            handler: (_req, res) => {
                res.status(429).json({
                    message: "Too many attempts, please try again later",
                });
            },
        });

    return {
        register: make("register", {
            windowMs: 60 * 60_000,
            limit: 20,
        }),
    };
}

export const limiters = createLimiters(redis);
