import logger from "../log/logger";
import { cleanupUnverifiedUsers } from "./cleanUnverfiedUser";

const CLEANUP_INTERVAL = 60 * 60 * 1000;

let timer: NodeJS.Timeout | null = null;

const runCleanup = async (): Promise<void> => {
    try {
        const count = await cleanupUnverifiedUsers();
        if (count > 0) {
            logger.log(`🧹 Removed ${count} unverified accounts`);
        }
    } catch (error) {
        logger.error("💥 Cleanup failed:", error);
    }
};

export const startCleanup = (): void => {
    if (timer) return; // already running

    void runCleanup(); // run once at startup, then on the interval
    timer = setInterval(() => void runCleanup(), CLEANUP_INTERVAL);
    timer.unref();

    logger.log("🛫 Cleanup scheduler started");
};

export const stopCleanup = (): void => {
    if (timer) {
        clearInterval(timer);
        timer = null;
        logger.log("🔻 Cleanup scheduler stopped");
    }
};
