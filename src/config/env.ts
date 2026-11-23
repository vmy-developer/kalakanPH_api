import dotenv from "dotenv";
import { z } from "zod";
import { BadRequestError } from "../common/error/errorStatusCode";

dotenv.config({ quiet: true });

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    PORT: z.coerce.number().int().positive().default(5000),
    TRUST_PROXY_HOPS: z
        .string()
        .optional()
        .transform((value) => Number(value) || 2),
    CLIENT_URL: z.string().min(1).default("http://localhost:3000"),

    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1).default("redis://localhost:15060"),

    JWT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),

    SUPABASE_URL: z.string().min(1),
    SUPABASE_SECRET_KEY: z.string().min(1),

    BREVO_API_KEY: z.string().min(1),
    MAIL_FROM: z.string().min(1),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    throw new BadRequestError(
        `Invalid environment configuration:\n${z.prettifyError(parsed.error)}`,
    );
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
