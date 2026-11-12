import bcrypt from "bcryptjs";
import crypto from "crypto";

import type { RegisterData, VerifyEmailInput } from "./dtos/auth.data.dto";
import userRepository from "../user/user.repository";
import authRepository from "./auth.repository";
import type { IUser } from "../user/types/user.interface";
import type { IAuth } from "./types/auth.interface";
import {
    BadRequestError,
    ConflictError,
} from "../../../../common/error/errorStatusCode";
import { pool } from "../../../../config/database";
import { sendVerificationEmail } from "../../../../common/utils/mail/sendVerificationEmail";
import { sendInBackground } from "../../../../common/utils/mail/sendMail";
import {
    deleteProfilePicture,
    getProfilePictureUrl,
    uploadProfilePicture,
} from "../../../../common/utils/storage/profilePicture.storage";
import { sendWelcomeEmail } from "../../../../common/utils/mail/sendWelcomeEmail";

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
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const unverifiedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const contactNumber = `+63${phoneNumber}`;

    const picturePath = profilePicture
        ? await uploadProfilePicture(profilePicture)
        : null;

    const client = await pool.connect();

    let user: IUser;
    let auth: IAuth;

    try {
        await client.query("BEGIN");

        if (await userRepository.findExistingUsername(username, client)) {
            throw new ConflictError("Username already exists");
        }
        if (await userRepository.findExistingEmail(email, client)) {
            throw new ConflictError("Email already exists");
        }
        if (
            await userRepository.findExistingContactNumber(
                contactNumber,
                client,
            )
        ) {
            throw new ConflictError("Contact number already exists");
        }

        user = await userRepository.create(
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

        auth = await authRepository.create(
            {
                userId: user.id,
                passwordHash,
                verificationToken,
                verificationTokenExpiry,
                unverifiedExpiresAt,
            },
            client,
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);

        if (picturePath) {
            await deleteProfilePicture(picturePath).catch(() => undefined);
        }

        if ((error as { code?: string }).code === "23505") {
            throw new ConflictError(
                "Username, email or contact number already exists",
            );
        }
        throw error;
    } finally {
        client.release();
    }

    sendInBackground(
        "verification",
        sendVerificationEmail(email, username, verificationToken),
    );

    return {
        userId: user.id,
        username: user.username,
        givenname: user.givenname,
        surname: user.surname,
        profile: await getProfilePictureUrl(user.profilePicture),
        birthdate: user.birthdate,
        gender: user.gender,
        contactNumber: user.contactNumber,
        address: user.address,
        email: user.email,
        isVerified: auth.isVerified,
    };
};

export const verifyEmailService = async ({ token }: VerifyEmailInput) => {
    const user = await authRepository.verifyByToken(token);

    if (!user) {
        throw new BadRequestError("Invalid or expired verification link");
    }

    sendInBackground("welcome", sendWelcomeEmail(user.email, user.username));

    return { userId: user.userId, isVerified: true };
};

export const resendVerificationService = async (userId: string) => {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await authRepository.refreshVerificationTokenByUserId(
        userId,
        token,
        tokenExpiry,
    );

    if (!user) {
        throw new BadRequestError("Account is already verified");
    }

    sendInBackground(
        "verification",
        sendVerificationEmail(user.email, user.username, token),
    );
};
