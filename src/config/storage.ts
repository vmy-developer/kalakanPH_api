import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { createClient } from "@supabase/supabase-js";
import logger from "../common/utils/log/logger";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not defined");
}

export const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
});

export const PROFILE_BUCKET = "profile-pictures";

const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 5;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const verifyStorage = async (): Promise<void> => {
    const { error } = await supabase.storage.getBucket(PROFILE_BUCKET);
    if (error) {
        throw new Error(`Supabase Storage responded with: ${error.message}`);
    }
};

export const checkStorage = async (): Promise<boolean> => {
    try {
        await verifyStorage();
        return true;
    } catch {
        return false;
    }
};

export const connectStorage = async (): Promise<void> => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await verifyStorage();
            logger.log("🛫 Supabase Storage ready");
            return;
        } catch (error) {
            logger.error(
                `💥 Storage check failed (${attempt}/${MAX_RETRIES}):`,
                error,
            );
            if (attempt === MAX_RETRIES) throw error;
            logger.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
            await sleep(RETRY_INTERVAL);
        }
    }
};
