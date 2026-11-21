import userRepository from "./user.repository";
import { NotFoundError } from "../../../../common/error/errorStatusCode";
import { getProfilePictureUrl } from "../../../../common/utils/storage/profilePicture.storage";

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
