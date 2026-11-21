import jwt from "jsonwebtoken";
import userRepository from "../user/user.repository";
import {
    BadRequestError,
    ConflictError,
    UnauthorizedError,
} from "../../../../common/error/errorStatusCode";
import { GoogleLoginInput, GoogleRegisterInput } from "./dtos/oauth.data.dto";
import oauthRepository from "./oauth.repository";
import { verifyGoogleToken } from "../../../../common/utils/google/verifyGoogleToken";
import { SignupPayload } from "./types/oauth.interface";
import { pool } from "../../../../config/database";

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

export const googleRegisterService = async ({
    signupToken,
    username,
    givenname,
    surname,
    birthdate,
    gender,
    phoneNumber,
    address,
}: GoogleRegisterInput) => {
    let payload: SignupPayload;
    try {
        payload = jwt.verify(signupToken, JWT_SECRET) as SignupPayload;
        if (payload.purpose !== "google-signup") throw new Error();
    } catch {
        throw new UnauthorizedError(
            "Signup session expired, please sign in with Google again",
        );
    }

    const finalGivenname = payload.givenname || givenname;
    const finalSurname = payload.surname || surname;
    if (!finalGivenname || !finalSurname) {
        throw new BadRequestError("Given name and surname are required");
    }

    const contactNumber = `+63${phoneNumber}`;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (await userRepository.findExistingUsername(username, client))
            throw new ConflictError("Username already exists");
        if (await userRepository.findExistingEmail(payload.email, client))
            throw new ConflictError("Email already exists");
        if (
            await userRepository.findExistingContactNumber(
                contactNumber,
                client,
            )
        )
            throw new ConflictError("Contact number already exists");

        const user = await userRepository.create(
            {
                loginMethod: "oauth",
                username,
                email: payload.email,
                contactNumber,
                givenname: finalGivenname,
                surname: finalSurname,
                gender,
                address,
                birthdate,
                profilePicture: payload.picture,
            },
            client,
        );

        await oauthRepository.create(user.id, payload.googleId, client);
        await client.query("COMMIT");

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            isVerified: true,
        };
    } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        if ((error as { code?: string }).code === "23505") {
            throw new ConflictError(
                "Username, email or contact number already exists",
            );
        }
        throw error;
    } finally {
        client.release();
    }
};
