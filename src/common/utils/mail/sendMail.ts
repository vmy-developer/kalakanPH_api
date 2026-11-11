import {
    BREVO_BASE_URL,
    REQUEST_TIMEOUT_MS,
    getMailConfig,
} from "../../../config/brevo";

export interface MailOptions {
    to: string;
    subject: string;
    html: string;
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

export const sendInBackground = (label: string, task: Promise<unknown>) => {
    task.catch((error) => {
        console.error(`📧 Failed to send ${label} email:`, error);
    });
};
