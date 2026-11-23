import { Router } from "express";
import { pool } from "./config/database";
import { checkRedis } from "./config/redis";
import { checkMailer } from "./config/brevo";
import { checkStorage } from "./config/storage";
import { authRouter } from "./features/v1/identity/auth";
import { oauthRouter } from "./features/v1/identity/oauth";
import { userRouter } from "./features/v1/identity/user";

const router = Router();

router.get("/health", async (_req, res) => {
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

router.use("/identity/auth", authRouter);
router.use("/identity/oauth", oauthRouter);
router.use("/identity/user", userRouter);

export default router;
