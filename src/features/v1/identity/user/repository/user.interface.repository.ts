import type { PoolClient } from "pg";
import type {
    IUser,
    CreateUserInput,
    UpdateUserInput,
} from "../types/user.interface";

export interface IUserRepository {
    findExistingUsername(
        username: string,
        client?: PoolClient,
    ): Promise<boolean>;

    findExistingContactNumber(
        contactNumber: string,
        client?: PoolClient,
    ): Promise<boolean>;

    findExistingEmail(email: string, client?: PoolClient): Promise<boolean>;

    create(data: CreateUserInput, client?: PoolClient): Promise<IUser>;

    findById(id: string, client?: PoolClient): Promise<IUser | null>;

    updateById(
        id: string,
        data: UpdateUserInput,
        client?: PoolClient,
    ): Promise<IUser | null>;

    isUsernameTakenByOther(
        username: string,
        userId: string,
        client?: PoolClient,
    ): Promise<boolean>;

    isContactNumberTakenByOther(
        contactNumber: string,
        userId: string,
        client?: PoolClient,
    ): Promise<boolean>;

    updatePicture(
        id: string,
        path: string,
        client?: PoolClient,
    ): Promise<string | null>;

    findPasswordHashByUserId(
        userId: string,
        client?: PoolClient,
    ): Promise<string | null>;

    updatePasswordHash(
        userId: string,
        passwordHash: string,
        client?: PoolClient,
    ): Promise<void>;
}
