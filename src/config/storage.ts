import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import { retry } from "./retry";
import logger from "../common/utils/log/logger";

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
        auth: { persistSession: false, autoRefreshToken: false },
    },
);

export const PROFILE_BUCKET = "profile-pictures";

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
    await retry(verifyStorage, { label: "Storage" });
    logger.log("🛫 Supabase Storage ready");
};
