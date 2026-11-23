import {
    BREVO_BASE_URL,
    REQUEST_TIMEOUT_MS,
    getMailConfig,
} from "../../../config/brevo";
import logger from "../log/logger";

export interface MailContent {
    subject: string;
    html: string;
}

export interface MailOptions extends MailContent {
    to: string;
}

export const sendMail = async ({ to, subject, html }: MailOptions) => {
    const { apiKey, from } = getMailConfig();

    const response = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: from,
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
            `Email provider responded with ${response.status}: ${detail}`,
        );
    }
};

export const fireAndForget = (label: string, task: Promise<unknown>) => {
    task.catch((error) => {
        logger.error(`📧 Failed to send ${label} email:`, error);
    });
};
