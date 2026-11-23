import { getProfilePictureUrl } from "../../../../../common/utils/storage/profilePicture.storage";
import type { IUser } from "./user.interface";

/** The user fields exposed to clients, with the picture resolved to a URL. */
export const toProfileDto = async (user: IUser) => ({
    username: user.username,
    givenname: user.givenname,
    surname: user.surname,
    email: user.email,
    contactNumber: user.contactNumber,
    gender: user.gender,
    address: user.address,
    birthdate: user.birthdate,
    profile: await getProfilePictureUrl(user.profilePicture),
});

export type ProfileDto = Awaited<ReturnType<typeof toProfileDto>>;
