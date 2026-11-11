import { cleanupUnverifiedUsers } from "./cleanUnverfiedUser";

const CLEANUP_INTERVAL = 60 * 60 * 1000;

let timer: NodeJS.Timeout | null = null;

const runCleanup = async (): Promise<void> => {
    try {
        const count = await cleanupUnverifiedUsers();
        if (count > 0) {
            console.log(`🧹 Removed ${count} unverified accounts`);
        }
    } catch (error) {
        console.error("💥 Cleanup failed:", error);
    }
};

export const startCleanup = (): void => {
    if (timer) return; // already running

    void runCleanup(); // run once at startup, then on the interval
    timer = setInterval(() => void runCleanup(), CLEANUP_INTERVAL);
    timer.unref();

    console.log("🛫 Cleanup scheduler started");
};

export const stopCleanup = (): void => {
    if (timer) {
        clearInterval(timer);
        timer = null;
        console.log("🔻 Cleanup scheduler stopped");
    }
};
