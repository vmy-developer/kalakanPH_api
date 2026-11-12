import type { PoolClient } from "pg";
import type { IAuth, CreateAuthInput } from "../types/auth.interface";

export interface IAuthRepository {
    create(data: CreateAuthInput, client?: PoolClient): Promise<IAuth>;

    deleteExpiredUnverified(client?: PoolClient): Promise<string[]>;

    verifyByToken(
        token: string,
        client?: PoolClient,
    ): Promise<{ userId: string; email: string; username: string } | null>;

    refreshVerificationTokenByUserId(
        userId: string,
        token: string,
        tokenExpiry: Date,
        client?: PoolClient,
    ): Promise<{ email: string; username: string } | null>;

    findLoginByEmail(
        email: string,
        client?: PoolClient,
    ): Promise<{
        userId: string;
        email: string;
        username: string;
        passwordHash: string | null;
        isVerified: boolean | null;
    } | null>;

    markLogin(userId: string, client?: PoolClient): Promise<void>;
}
