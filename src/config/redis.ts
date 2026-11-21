import "dotenv/config";
import { createClient } from "redis";
import logger from "../common/utils/log/logger";

const RETRY_INTERVAL = 5000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const redis = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    disableOfflineQueue: true,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
});

redis.on("error", (err: unknown) => {
    if (err instanceof Error) {
        logger.error("💥 Redis error:", err.message);
    } else {
        logger.error("💥 Redis error:", err);
    }
});
redis.on("reconnecting", () => logger.warn("🔄 Redis reconnecting..."));
redis.on("end", () => logger.warn("🔻 Redis disconnected"));

export const connectRedis = async (): Promise<void> => {
    while (true) {
        try {
            if (!redis.isOpen) await redis.connect();
            await redis.ping();
            logger.log("🛫 Redis connected");
            return;
        } catch (error) {
            logger.error("💥 Redis initial connection failed:", error);
            logger.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);

            if (redis.isOpen) await redis.disconnect().catch(() => {});
            await sleep(RETRY_INTERVAL);
        }
    }
};

export const checkRedis = async (): Promise<boolean> => {
    try {
        return (await redis.ping()) === "PONG";
    } catch {
        return false;
    }
};
