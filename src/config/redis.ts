import "dotenv/config";
import { createClient } from "redis";

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
        console.error("💥 Redis error:", err.message);
    } else {
        console.error("💥 Redis error:", err);
    }
});
redis.on("reconnecting", () => console.warn("🔄 Redis reconnecting..."));
redis.on("end", () => console.warn("🔻 Redis disconnected"));

export const connectRedis = async (): Promise<void> => {
    while (true) {
        try {
            if (!redis.isOpen) await redis.connect();
            await redis.ping();
            console.log("🛫 Redis connected");
            return;
        } catch (error) {
            console.error("💥 Redis initial connection failed:", error);
            console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);

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
