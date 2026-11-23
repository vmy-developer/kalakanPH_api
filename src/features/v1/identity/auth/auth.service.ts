import bcrypt from "bcryptjs";

import type {
    LoginInput,
    RegisterData,
    VerifyEmailInput,
} from "./dtos/auth.data.dto";
import userRepository from "../user/user.repository";
import authRepository from "./auth.repository";
import {
    BadRequestError,
    UnauthorizedError,
} from "../../../../common/error/errorStatusCode";
import { withTransaction } from "../../../../common/utils/database/withTransaction";
import { sendVerificationEmail } from "../../../../common/utils/mail/sendVerificationEmail";
import { fireAndForget } from "../../../../common/utils/mail/sendMail";
import {
    deleteProfilePicture,
    uploadProfilePicture,
} from "../../../../common/utils/storage/profilePicture.storage";
import { sendWelcomeEmail } from "../../../../common/utils/mail/sendWelcomeEmail";
import { toProfileDto } from "../user/types/user.mapper";
import {
    assertUserUnique,
    mapUniqueViolation,
} from "../user/types/user.uniqueness";
import {
    BCRYPT_ROUNDS,
    UNVERIFIED_ACCOUNT_TTL_MS,
    VERIFICATION_TOKEN_TTL_MS,
} from "../../../../common/constants/constants";
import { toContactNumber } from "../../../../common/phone/phone";
import crypto from "crypto";

const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_ROUNDS);

const createVerificationToken = () => ({
    token: crypto.randomBytes(32).toString("hex"),
    expiry: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
});

export const registerService = async (
    {
        username,
        givenname,
        surname,
        email,
        password,
        birthdate,
        gender,
        phoneNumber,
        address,
    }: RegisterData,
    profilePicture?: Express.Multer.File,
) => {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verification = createVerificationToken();
    const unverifiedExpiresAt = new Date(
        Date.now() + UNVERIFIED_ACCOUNT_TTL_MS,
    );
    const contactNumber = toContactNumber(phoneNumber);

    const picturePath = profilePicture
        ? await uploadProfilePicture(profilePicture)
        : null;

    let created;
    try {
        created = await withTransaction(async (client) => {
            await assertUserUnique(
                { username, email, contactNumber },
                { client },
            );

            const user = await userRepository.create(
                {
                    loginMethod: "local",
                    username,
                    email,
                    contactNumber,
                    givenname,
                    surname,
                    gender,
                    address,
                    birthdate,
                    profilePicture: picturePath,
                },
                client,
            );

            const auth = await authRepository.create(
                {
                    userId: user.id,
                    passwordHash,
                    verificationToken: verification.token,
                    verificationTokenExpiry: verification.expiry,
                    unverifiedExpiresAt,
                },
                client,
            );

            return { user, auth };
        });
    } catch (error) {
        if (picturePath) {
            await deleteProfilePicture(picturePath).catch(() => undefined);
        }
        throw mapUniqueViolation(error);
    }

    const { user, auth } = created;

    fireAndForget(
        "verification",
        sendVerificationEmail(email, username, verification.token),
    );

    return {
        userId: user.id,
        ...(await toProfileDto(user)),
        isVerified: auth.isVerified,
    };
};

export const verifyEmailService = async ({ token }: VerifyEmailInput) => {
    const user = await authRepository.verifyByToken(token);

    if (!user) {
        throw new BadRequestError("Invalid or expired verification link");
    }

    fireAndForget("welcome", sendWelcomeEmail(user.email, user.username));

    return { userId: user.userId, isVerified: true };
};

export const resendVerificationService = async (userId: string) => {
    const { token, expiry } = createVerificationToken();

    const user = await authRepository.refreshVerificationTokenByUserId(
        userId,
        token,
        expiry,
    );

    if (!user) {
        throw new BadRequestError("Account is already verified");
    }

    await sendVerificationEmail(user.email, user.username, token);
};

export const loginService = async ({ email, password }: LoginInput) => {
    const record = await authRepository.findLoginByEmail(email);

    const hash = record?.passwordHash ?? DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hash);

    if (!record || !record.passwordHash || !passwordOk) {
        throw new UnauthorizedError("Invalid email or password");
    }

    await authRepository.markLogin(record.userId);

    return {
        userId: record.userId,
        username: record.username,
        email: record.email,
        isVerified: record.isVerified ?? false,
    };
};

export const logoutService = async (userId: string): Promise<void> => {
    await authRepository.markLogout(userId);
};

export const meService = async (userId: string) => {
    const session = await authRepository.findSessionById(userId);

    if (!session) {
        throw new UnauthorizedError("User not found");
    }

    return session;
};
