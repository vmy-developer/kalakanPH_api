import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./common/middleware/errorHandler";
import apiRouter from "./router";
import { env, isProduction } from "./config/env";

const app = express();

if (isProduction) {
    app.set("trust proxy", env.TRUST_PROXY_HOPS);
}

app.use(helmet());
app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handler: must be last
app.use(errorHandler);

export default app;
