import userRepository from "./user.repository";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
} from "../../../../common/error/errorStatusCode";
import {
    deleteProfilePicture,
    getProfilePictureUrl,
    uploadProfilePicture,
} from "../../../../common/utils/storage/profilePicture.storage";
import {
    ChangePasswordInput,
    SearchUsersInput,
    UpdateProfileInput,
    UsernameParamInput,
} from "./dtos/user.data.dto";
import { UpdateUserInput } from "./types/user.interface";
import bcrypt from "bcryptjs";

export const getProfileService = async (userId: string) => {
    const user = await userRepository.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return {
        username: user.username,
        givenname: user.givenname,
        surname: user.surname,
        email: user.email,
        contactNumber: user.contactNumber,
        gender: user.gender,
        address: user.address,
        birthdate: user.birthdate,
        profile: await getProfilePictureUrl(user.profilePicture),
    };
};

export const updateProfileService = async (
    userId: string,
    { phoneNumber, ...rest }: UpdateProfileInput,
) => {
    const changes: UpdateUserInput = { ...rest };
    if (phoneNumber !== undefined) {
        changes.contactNumber = `+63${phoneNumber}`;
    }

    if (
        changes.username &&
        (await userRepository.isUsernameTakenByOther(changes.username, userId))
    ) {
        throw new ConflictError("Username already exists");
    }
    if (
        changes.contactNumber &&
        (await userRepository.isContactNumberTakenByOther(
            changes.contactNumber,
            userId,
        ))
    ) {
        throw new ConflictError("Contact number already exists");
    }

    try {
        const user = await userRepository.updateById(userId, changes);
        if (!user) throw new NotFoundError("User not found");
    } catch (error) {
        if ((error as { code?: string }).code === "23505") {
            throw new ConflictError(
                "Username or contact number already exists",
            );
        }
        throw error;
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
    const currentHash = await userRepository.findPasswordHashByUserId(userId);

    if (!currentHash) {
        throw new BadRequestError(
            "This account uses Google sign-in and has no password",
        );
    }

    const ok = await bcrypt.compare(currentPassword, currentHash);
    if (!ok) {
        throw new UnauthorizedError("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePasswordHash(userId, newHash);
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

    return {
        username: user.username,
        givenname: user.givenname,
        surname: user.surname,
        email: user.email,
        contactNumber: user.contactNumber,
        gender: user.gender,
        address: user.address,
        birthdate: user.birthdate,
        profile: await getProfilePictureUrl(user.profilePicture),
    };
};
