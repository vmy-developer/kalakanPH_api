import type { PoolClient } from "pg";
import type { IUser, CreateUserInput } from "../types/user.interface";

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
}
