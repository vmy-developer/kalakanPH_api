import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { Pool } from "pg";
import logger from "../common/utils/log/logger";

const RETRY_INTERVAL = 5000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
});

pool.on("error", (error) => {
    logger.error("💥 PostgreSQL pool error:", error);
});

pool.on("connect", () => {
    logger.log("🔌 PostgreSQL client connected");
});

const connectDB = async (): Promise<void> => {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not properly defined");
    }

    while (true) {
        try {
            const client = await pool.connect();

            try {
                await client.query("SELECT 1");
            } finally {
                client.release();
            }

            logger.log("🛫 PostgreSQL (Supabase) connected");
            return;
        } catch (error) {
            logger.error("💥 PostgreSQL initial connection failed:", error);
            logger.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);

            await sleep(RETRY_INTERVAL);
        }
    }
};

export const disconnectDB = async (): Promise<void> => {
    await pool.end();
    logger.log("🔻 PostgreSQL disconnected");
};

export default connectDB;
