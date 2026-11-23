import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../error/errorStatusCode";
import type { SignupPayload } from "../../../features/v1/identity/oauth/types/oauth.interface";
import { SESSION_TTL_MS, SIGNUP_TOKEN_TTL_MS } from "../../constants/constants";
import { env } from "../../../config/env";

interface SessionPayload {
    userId: string;
}

export const signSession = (userId: string): string =>
    jwt.sign({ userId } satisfies SessionPayload, env.JWT_SECRET, {
        expiresIn: SESSION_TTL_MS / 1000,
    });

/** Returns the user id, or throws UnauthorizedError. */
export const verifySession = (token: string): string => {
    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as SessionPayload;
        return payload.userId;
    } catch {
        throw new UnauthorizedError("Invalid or expired session");
    }
};

export const signSignupToken = (
    payload: Omit<SignupPayload, "purpose">,
): string =>
    jwt.sign(
        { ...payload, purpose: "google-signup" } satisfies SignupPayload,
        env.JWT_SECRET,
        { expiresIn: SIGNUP_TOKEN_TTL_MS / 1000 },
    );

export const verifySignupToken = (token: string): SignupPayload => {
    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as SignupPayload;
        if (payload.purpose !== "google-signup") throw new Error();
        return payload;
    } catch {
        throw new UnauthorizedError(
            "Signup session expired, please sign in with Google again",
        );
    }
};
