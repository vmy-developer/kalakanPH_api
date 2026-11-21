const isDev = process.env.NODE_ENV === "development";

const logger = {
    log: (...args: unknown[]): void => {
        if (isDev) console.log(...args);
    },

    warn: (...args: unknown[]): void => {
        if (isDev) console.warn(...args);
    },

    error: (...args: unknown[]): void => {
        if (isDev) console.error(...args);
    },
};

export default logger;
