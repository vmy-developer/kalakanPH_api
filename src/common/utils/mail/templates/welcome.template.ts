import { env } from "../../../../config/env";
import type { MailContent } from "../sendMail";
import { emailButton, emailLayout } from "./layout";

export const welcomeTemplate = (username: string): MailContent => ({
    subject: "Welcome aboard!",
    html: emailLayout(`
        <h2>Welcome ${username}!</h2>
        <p>Your email has been verified and your account is now active. We're glad to have you.</p>
        ${emailButton(env.CLIENT_URL, "Get Started")}
    `),
});
