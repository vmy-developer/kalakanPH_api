import { isDevelopment } from "../../../config/env";

const logger = {
    log: (...args: unknown[]): void => {
        if (isDevelopment) console.log(...args);
    },

    warn: (...args: unknown[]): void => {
        if (isDevelopment) console.warn(...args);
    },

    error: (...args: unknown[]): void => {
        if (isDevelopment) console.error(...args);
    },
};

export default logger;
