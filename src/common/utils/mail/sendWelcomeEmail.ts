import { sendMail } from "./sendMail";
import { welcomeTemplate } from "./templates/welcome.template";

export const sendWelcomeEmail = async (email: string, username: string) => {
    await sendMail({ to: email, ...welcomeTemplate(username) });
};
