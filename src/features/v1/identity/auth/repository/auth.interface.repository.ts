import type { PoolClient } from "pg";
import type { IAuth, CreateAuthInput } from "../types/auth.interface";

export interface IAuthRepository {
    create(data: CreateAuthInput, client?: PoolClient): Promise<IAuth>;

    deleteExpiredUnverified(client?: PoolClient): Promise<string[]>;

    verifyByToken(
        token: string,
        client?: PoolClient,
    ): Promise<{ userId: string; email: string; username: string } | null>;
}
