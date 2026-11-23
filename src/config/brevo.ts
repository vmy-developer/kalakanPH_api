import { env } from "./env";
import { retry } from "./retry";
import logger from "../common/utils/log/logger";

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

const mailConfig = {
    apiKey: env.BREVO_API_KEY,
    from: parseSender(env.MAIL_FROM),
};

export const getMailConfig = () => mailConfig;

const verifyMailer = async (): Promise<void> => {
    const response = await fetch(`${BREVO_BASE_URL}/account`, {
        headers: { "api-key": mailConfig.apiKey, accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) return;

    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo responded with ${response.status}: ${detail}`);
};

export const checkMailer = async (): Promise<boolean> => {
    try {
        await verifyMailer();
        return true;
    } catch {
        return false;
    }
};

const connectMailer = async (): Promise<void> => {
    await retry(verifyMailer, { label: "Mailer" });
    logger.log("🛫 Mailer (Brevo) ready");
};

export default connectMailer;
