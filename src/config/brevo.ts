import dotenv from "dotenv";
import logger from "../common/utils/log/logger";
dotenv.config({ quiet: true });

const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 5;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const BREVO_BASE_URL = "https://api.brevo.com/v3";

export const REQUEST_TIMEOUT_MS = 10_000;

export interface MailSender {
    email: string;
    name?: string;
}

// Accepts "support@example.com" or "My App <support@example.com>"
const parseSender = (value: string): MailSender => {
    const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    if (match) {
        const name = match[1].replace(/^"|"$/g, "");
        return name ? { email: match[2], name } : { email: match[2] };
    }
    return { email: value.trim() };
};

export const getMailConfig = () => {
    const apiKey = process.env.BREVO_API_KEY;
    const from = process.env.MAIL_FROM;

    if (!apiKey) {
        throw new Error("BREVO_API_KEY is not configured.");
    }
    if (!from) {
        throw new Error("MAIL_FROM is not configured.");
    }

    return { apiKey, from: parseSender(from) };
};

const verifyMailer = async (apiKey: string): Promise<void> => {
    const response = await fetch(`${BREVO_BASE_URL}/account`, {
        headers: { "api-key": apiKey, accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) return;

    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo responded with ${response.status}: ${detail}`);
};

export const checkMailer = async (): Promise<boolean> => {
    try {
        const { apiKey } = getMailConfig();
        await verifyMailer(apiKey);
        return true;
    } catch {
        return false;
    }
};

const connectMailer = async (): Promise<void> => {
    const { apiKey } = getMailConfig();

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await verifyMailer(apiKey);
            logger.log("🛫 Mailer (Brevo) ready");
            return;
        } catch (error) {
            logger.error(
                `💥 Mailer check failed (${attempt}/${MAX_RETRIES}):`,
                error,
            );
            if (attempt === MAX_RETRIES) throw error;
            logger.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
            await sleep(RETRY_INTERVAL);
        }
    }
};

export default connectMailer;
