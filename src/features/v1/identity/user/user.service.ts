import userRepository from "./user.repository";
import {
    ConflictError,
    NotFoundError,
} from "../../../../common/error/errorStatusCode";
import { getProfilePictureUrl } from "../../../../common/utils/storage/profilePicture.storage";
import { UpdateProfileInput } from "./dtos/user.data.dto";
import { UpdateUserInput } from "./types/user.interface";

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
