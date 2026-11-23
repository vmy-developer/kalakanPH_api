import { sendMail } from "./sendMail";
import { verificationTemplate } from "./templates/verification.template";

export const sendVerificationEmail = async (
    email: string,
    username: string,
    token: string,
) => {
    await sendMail({ to: email, ...verificationTemplate(username, token) });
};
