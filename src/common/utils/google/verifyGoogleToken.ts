import { OAuth2Client } from "google-auth-library";
import { UnauthorizedError } from "../../error/errorStatusCode";
import type { GoogleIdentity } from "../../../features/v1/identity/oauth/types/oauth.interface";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not defined");

const client = new OAuth2Client(CLIENT_ID);

export const verifyGoogleToken = async (
    idToken: string,
): Promise<GoogleIdentity> => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const p = ticket.getPayload();

        if (!p?.sub || !p.email || !p.email_verified) {
            throw new Error("Unverified Google account");
        }

        return {
            googleId: p.sub,
            email: p.email.toLowerCase(),
            givenname: p.given_name ?? "",
            surname: p.family_name ?? "",
            picture: p.picture ?? null,
        };
    } catch {
        throw new UnauthorizedError("Invalid Google token");
    }
};
