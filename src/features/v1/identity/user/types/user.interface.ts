import { UserGender } from "./user.enum";

type LoginMethod = "local" | "oauth";

export interface IUser {
    id: string;
    loginMethod: LoginMethod;
    username: string;
    email: string;
    contactNumber: string;
    givenname: string;
    surname: string;
    gender: UserGender;
    address: string;
    birthdate: Date;
    profilePicture: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateUserInput = Omit<IUser, "id" | "createdAt" | "updatedAt">;

export type UpdateUserInput = Partial<
    Pick<
        IUser,
        | "username"
        | "givenname"
        | "surname"
        | "gender"
        | "birthdate"
        | "contactNumber"
        | "address"
    >
>;

export type UniqueField = "username" | "email" | "contactNumber";

export type UniqueFields = Partial<Record<UniqueField, string>>;

export interface UserSearchResult {
    username: string;
    givenname: string;
    surname: string;
    profilePicture: string | null;
}
