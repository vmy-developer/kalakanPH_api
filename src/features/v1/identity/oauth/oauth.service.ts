import jwt from "jsonwebtoken";
import userRepository from "../user/user.repository";
import { ConflictError } from "../../../../common/error/errorStatusCode";
import { GoogleLoginInput } from "./dtos/oauth.data.dto";
import oauthRepository from "./oauth.repository";
import { verifyGoogleToken } from "../../../../common/utils/google/verifyGoogleToken";
import { SignupPayload } from "./types/oauth.interface";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export const googleLoginService = async ({ idToken }: GoogleLoginInput) => {
    const g = await verifyGoogleToken(idToken);

    const userId = await oauthRepository.findUserByGoogleId(g.googleId);
    if (userId) {
        await oauthRepository.markLogin(userId);
        return { status: "logged_in" as const, userId, email: g.email };
    }

    if (await userRepository.findExistingEmail(g.email)) {
        throw new ConflictError(
            "This email is registered with a password. Please log in with email and password.",
        );
    }

    const payload: SignupPayload = {
        googleId: g.googleId,
        email: g.email,
        givenname: g.givenname,
        surname: g.surname,
        picture: g.picture,
        purpose: "google-signup",
    };
    const signupToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "10m" });

    return {
        status: "needs_profile" as const,
        signupToken,
        prefill: {
            email: g.email,
            givenname: g.givenname,
            surname: g.surname,
        },
    };
};
