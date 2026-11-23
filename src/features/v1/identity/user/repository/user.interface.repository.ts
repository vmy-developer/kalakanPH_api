import type { PoolClient } from "pg";
import type {
    IUser,
    CreateUserInput,
    UpdateUserInput,
    UserSearchResult,
    UniqueField,
    UniqueFields,
} from "../types/user.interface";

export interface IUserRepository {
    /**
     * One query; returns which of the given fields already belong to another
     * user (optionally ignoring `excludeId`). Order: username, email, contactNumber.
     */
    findConflicts(
        fields: UniqueFields,
        excludeId?: string,
        client?: PoolClient,
    ): Promise<UniqueField[]>;

    create(data: CreateUserInput, client?: PoolClient): Promise<IUser>;

    findById(id: string, client?: PoolClient): Promise<IUser | null>;

    updateById(
        id: string,
        data: UpdateUserInput,
        client?: PoolClient,
    ): Promise<IUser | null>;

    updatePicture(
        id: string,
        path: string,
        client?: PoolClient,
    ): Promise<string | null>;

    search(
        query: string,
        excludeUserId: string,
        limit: number,
        offset: number,
        client?: PoolClient,
    ): Promise<UserSearchResult[]>;

    findByUsername(
        username: string,
        client?: PoolClient,
    ): Promise<IUser | null>;

    deleteById(
        id: string,
        client?: PoolClient,
    ): Promise<string | null | undefined>;
}
