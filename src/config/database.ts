import { Pool } from "pg";
import { env } from "./env";
import { retry } from "./retry";
import logger from "../common/utils/log/logger";

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
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

const pingDB = async (): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query("SELECT 1");
    } finally {
        client.release();
    }
};

const connectDB = async (): Promise<void> => {
    await retry(pingDB, { label: "PostgreSQL", attempts: Infinity });
    logger.log("🛫 PostgreSQL (Supabase) connected");
};

export const disconnectDB = async (): Promise<void> => {
    await pool.end();
    logger.log("🔻 PostgreSQL disconnected");
};

export default connectDB;
