import type { PoolClient } from "pg";

export interface IOAuthRepository {
    findUserByGoogleId(
        googleId: string,
        client?: PoolClient,
    ): Promise<string | null>;

    markLogin(userId: string, client?: PoolClient): Promise<void>;

    create(
        userId: string,
        googleId: string,
        client?: PoolClient,
    ): Promise<void>;

    markLogout(userId: string, client?: PoolClient): Promise<void>;
}
