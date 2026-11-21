import dotenv from "dotenv";
dotenv.config({ quiet: true });

import app from "./app";
import connectDB, { disconnectDB } from "./config/database";
import connectMailer from "./config/brevo";
import { connectRedis } from "./config/redis";
import { connectStorage } from "./config/storage";
import { startCleanup, stopCleanup } from "./common/utils/database/cleanup";
import logger from "./common/utils/log/logger";

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB();
        await connectMailer();
        await connectRedis();
        await connectStorage();

        const server = app.listen(PORT, () => {
            logger.log(`🛫 Server is running on http://localhost:${PORT}`);
        });

        startCleanup();

        const shutdown = () => {
            stopCleanup();
            server.close(() => {
                disconnectDB()
                    .then(() => process.exit(0))
                    .catch((error) => {
                        logger.error("💥 Error during shutdown:", error);
                        process.exit(1);
                    });
            });
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);
    } catch (error) {
        logger.error("💥 Failed to start server:", error);
        process.exit(1);
    }
};

void start();
