import { env } from "../../../../config/env";
import {
    MINUTE_MS,
    VERIFICATION_TOKEN_TTL_MS,
} from "../../../constants/constants";

import type { MailContent } from "../sendMail";
import { emailButton, emailFootnote, emailLayout } from "./layout";

export const verificationTemplate = (
    username: string,
    token: string,
): MailContent => {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
    const minutes = VERIFICATION_TOKEN_TTL_MS / MINUTE_MS;

    return {
        subject: "Verify your email",
        html: emailLayout(`
            <h1>Dear ${username},</h1>
            <h2>Verify your email</h2>
            <p>Thanks for signing up! Click the button below to verify your email address. This link expires in ${minutes} minutes.</p>
            ${emailButton(verifyUrl, "Verify Email")}
            ${emailFootnote("If you didn't create an account, you can safely ignore this email.")}
        `),
    };
};
