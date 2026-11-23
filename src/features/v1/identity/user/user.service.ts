import bcrypt from "bcryptjs";
import userRepository from "./user.repository";
import authRepository from "../auth/auth.repository";
import oauthRepository from "../oauth/oauth.repository";
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from "../../../../common/error/errorStatusCode";
import {
    deleteProfilePicture,
    getProfilePictureUrl,
    uploadProfilePicture,
} from "../../../../common/utils/storage/profilePicture.storage";
import { verifyGoogleToken } from "../../../../common/utils/google/verifyGoogleToken";
import type {
    ChangePasswordInput,
    DeleteAccountInput,
    SearchUsersInput,
    UpdateProfileInput,
    UsernameParamInput,
} from "./dtos/user.data.dto";
import type { UpdateUserInput } from "./types/user.interface";
import { toProfileDto } from "./types/user.mapper";
import { assertUserUnique, mapUniqueViolation } from "./types/user.uniqueness";
import { toContactNumber } from "../../../../common/phone/phone";
import { BCRYPT_ROUNDS } from "../../../../common/constants/constants";

export const getProfileService = async (userId: string) => {
    const user = await userRepository.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return toProfileDto(user);
};

export const updateProfileService = async (
    userId: string,
    { phoneNumber, ...rest }: UpdateProfileInput,
) => {
    const changes: UpdateUserInput = { ...rest };
    if (phoneNumber !== undefined) {
        changes.contactNumber = toContactNumber(phoneNumber);
    }

    await assertUserUnique(
        {
            username: changes.username,
            contactNumber: changes.contactNumber,
        },
        { excludeId: userId },
    );

    try {
        const user = await userRepository.updateById(userId, changes);
        if (!user) throw new NotFoundError("User not found");
    } catch (error) {
        throw mapUniqueViolation(
            error,
            "Username or contact number already exists",
        );
    }

    return getProfileService(userId);
};

export const updatePictureService = async (
    userId: string,
    file?: Express.Multer.File,
) => {
    if (!file) throw new BadRequestError("Profile picture is required");

    const newPath = await uploadProfilePicture(file);

    try {
        const oldPicture = await userRepository.updatePicture(userId, newPath);
        if (oldPicture) {
            await deleteProfilePicture(oldPicture).catch(() => undefined);
        }
    } catch (error) {
        await deleteProfilePicture(newPath).catch(() => undefined);
        throw error;
    }

    return { profile: await getProfilePictureUrl(newPath) };
};

export const changePasswordService = async (
    userId: string,
    { currentPassword, newPassword }: ChangePasswordInput,
): Promise<void> => {
    const currentHash = await authRepository.findPasswordHashByUserId(userId);

    if (!currentHash) {
        throw new BadRequestError(
            "This account uses Google sign-in and has no password",
        );
    }

    const ok = await bcrypt.compare(currentPassword, currentHash);
    if (!ok) {
        throw new UnauthorizedError("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await authRepository.updatePasswordHash(userId, newHash);
};

export const searchUsersService = async (
    userId: string,
    { q, limit, offset }: SearchUsersInput,
) => {
    const users = await userRepository.search(q, userId, limit, offset);

    const results = await Promise.all(
        users.map(async (u) => ({
            username: u.username,
            givenname: u.givenname,
            surname: u.surname,
            profile: await getProfilePictureUrl(u.profilePicture),
        })),
    );

    return { results, limit, offset, hasMore: results.length === limit };
};

export const getPublicProfileService = async ({
    username,
}: UsernameParamInput) => {
    const user = await userRepository.findByUsername(username);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return toProfileDto(user);
};

export const deleteAccountService = async (
    userId: string,
    { password, idToken }: DeleteAccountInput,
): Promise<void> => {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.loginMethod === "local") {
        if (!password) throw new BadRequestError("Password is required");

        const hash = await authRepository.findPasswordHashByUserId(userId);
        const ok = hash ? await bcrypt.compare(password, hash) : false;
        if (!ok) throw new BadRequestError("Incorrect password");
    } else {
        if (!idToken) throw new BadRequestError("Google token is required");

        const g = await verifyGoogleToken(idToken);
        const linkedUserId = await oauthRepository.findUserByGoogleId(
            g.googleId,
        );
        if (linkedUserId !== userId) {
            throw new BadRequestError("Google account does not match");
        }
    }

    const picture = await userRepository.deleteById(userId);

    if (picture) {
        await deleteProfilePicture(picture).catch(() => undefined);
    }
};
