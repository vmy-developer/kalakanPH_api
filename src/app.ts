import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pool } from "./config/database";
import { checkRedis } from "./config/redis";
import { checkMailer } from "./config/brevo";
import { checkStorage } from "./config/storage";
import { errorHandler } from "./common/middleware/errorHandler";
import apiRouter from "./router";

const app = express();

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS) || 2);
}

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", async (_req, res) => {
    const [database, redis, resend, storage] = await Promise.all([
        pool.query("SELECT 1").then(
            () => true,
            () => false,
        ),
        checkRedis(),
        checkMailer(),
        checkStorage(),
    ]);

    const services = {
        database: database ? "ok" : "unavailable",
        redis: redis ? "ok" : "unavailable",
        resend: resend ? "ok" : "unavailable",
        storage: storage ? "ok" : "unavailable",
    };
    const isHealthy = database && redis && resend && storage;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? "ok" : "unavailable",
        services,
    });
});

app.use("/api/v1", apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handler: must be last
app.use(errorHandler);

export default app;
