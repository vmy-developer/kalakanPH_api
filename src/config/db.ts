import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { Pool } from "pg";

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
    console.error("💥 PostgreSQL pool error:", error);
});

pool.on("connect", () => {
    console.log("🔌 PostgreSQL client connected");
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

            console.log("🛫 PostgreSQL (Supabase) connected");
            return;
        } catch (error) {
            console.error("💥 PostgreSQL initial connection failed:", error);
            console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);

            await sleep(RETRY_INTERVAL);
        }
    }
};

export const disconnectDB = async (): Promise<void> => {
    await pool.end();
    console.log("🔻 PostgreSQL disconnected");
};

export default connectDB;
