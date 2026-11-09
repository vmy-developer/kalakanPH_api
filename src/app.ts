import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pool } from "./config/db";

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
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ok" });
    } catch {
        res.status(503).json({ status: "unavailable" });
    }
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handler: must be last
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("💥 Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
});

export default app;
