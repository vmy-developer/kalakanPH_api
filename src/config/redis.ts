import { createClient } from "redis";
import { env } from "./env";
import { retry } from "./retry";
import logger from "../common/utils/log/logger";

export const redis = createClient({
    url: env.REDIS_URL,
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

const openRedis = async (): Promise<void> => {
    try {
        if (!redis.isOpen) await redis.connect();
        await redis.ping();
    } catch (error) {
        if (redis.isOpen) await redis.disconnect().catch(() => {});
        throw error;
    }
};

export const connectRedis = async (): Promise<void> => {
    await retry(openRedis, { label: "Redis", attempts: Infinity });
    logger.log("🛫 Redis connected");
};

export const checkRedis = async (): Promise<boolean> => {
    try {
        return (await redis.ping()) === "PONG";
    } catch {
        return false;
    }
};
