import logger from "../common/utils/log/logger";

export const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface RetryOptions {
    /** Shown in log lines, e.g. "PostgreSQL". */
    label: string;
    /** Total tries. Use Infinity to retry forever. Default 5. */
    attempts?: number;
    /** Delay between tries in ms. Default 5000. */
    intervalMs?: number;
}

export const retry = async <T>(
    fn: () => Promise<T>,
    { label, attempts = 5, intervalMs = 5000 }: RetryOptions,
): Promise<T> => {
    for (let attempt = 1; ; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const progress = Number.isFinite(attempts)
                ? `${attempt}/${attempts}`
                : `${attempt}`;
            logger.error(`💥 ${label} check failed (${progress}):`, error);

            if (attempt >= attempts) throw error;

            logger.log(`🔄 Retrying in ${intervalMs / 1000} seconds...`);
            await sleep(intervalMs);
        }
    }
};
