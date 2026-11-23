import userRepository from "../user/user.repository";
import {
    BadRequestError,
    ConflictError,
} from "../../../../common/error/errorStatusCode";
import { GoogleLoginInput, GoogleRegisterInput } from "./dtos/oauth.data.dto";
import oauthRepository from "./oauth.repository";
import { verifyGoogleToken } from "../../../../common/utils/google/verifyGoogleToken";
import { withTransaction } from "../../../../common/utils/database/withTransaction";
import {
    assertUserUnique,
    mapUniqueViolation,
} from "../user/types/user.uniqueness";
import {
    signSignupToken,
    verifySignupToken,
} from "../../../../common/utils/auth/token";
import { toContactNumber } from "../../../../common/phone/phone";

export const googleLoginService = async ({ idToken }: GoogleLoginInput) => {
    const g = await verifyGoogleToken(idToken);

    const userId = await oauthRepository.findUserByGoogleId(g.googleId);
    if (userId) {
        await oauthRepository.markLogin(userId);
        return { status: "logged_in" as const, userId, email: g.email };
    }

    const emailConflicts = await userRepository.findConflicts({
        email: g.email,
    });
    if (emailConflicts.length > 0) {
        throw new ConflictError(
            "This email is registered with a password. Please log in with email and password.",
        );
    }

    const signupToken = signSignupToken({
        googleId: g.googleId,
        email: g.email,
        givenname: g.givenname,
        surname: g.surname,
        picture: g.picture,
    });

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
    const payload = verifySignupToken(signupToken);

    const finalGivenname = payload.givenname || givenname;
    const finalSurname = payload.surname || surname;
    if (!finalGivenname || !finalSurname) {
        throw new BadRequestError("Given name and surname are required");
    }

    const contactNumber = toContactNumber(phoneNumber);

    try {
        const user = await withTransaction(async (client) => {
            await assertUserUnique(
                { username, email: payload.email, contactNumber },
                { client },
            );

            const created = await userRepository.create(
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

            await oauthRepository.create(created.id, payload.googleId, client);
            return created;
        });

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            isVerified: true,
        };
    } catch (error) {
        throw mapUniqueViolation(error);
    }
};
