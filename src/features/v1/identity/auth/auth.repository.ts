import type { IAuth } from "./types/auth.interface";
import type { IAuthRepository } from "./repository/auth.interface.repository";
import { getExecutor } from "../../../../common/utils/database/dbExecutor";

const AUTH_COLUMNS = `
    id,
    user_id                    AS "userId",
    password_hash              AS "passwordHash",
    is_online                  AS "isOnline",
    last_login                 AS "lastLogin",
    last_logout                AS "lastLogout",
    is_verified                AS "isVerified",
    unverified_expires_at      AS "unverifiedExpiresAt",
    verification_token         AS "verificationToken",
    verification_token_expiry  AS "verificationTokenExpiry",
    created_at                 AS "createdAt",
    updated_at                 AS "updatedAt"
`;

const authRepository: IAuthRepository = {
    create: async (data, client) => {
        const { rows } = await getExecutor(client).query<IAuth>(
            `INSERT INTO identity.auth
                (user_id, password_hash, verification_token,
                 verification_token_expiry, unverified_expires_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${AUTH_COLUMNS}`,
            [
                data.userId,
                data.passwordHash,
                data.verificationToken,
                data.verificationTokenExpiry,
                data.unverifiedExpiresAt,
            ],
        );
        return rows[0];
    },

    deleteExpiredUnverified: async (client) => {
        const { rows } = await getExecutor(client).query<{
            profilePicture: string | null;
        }>(
            `DELETE FROM identity.users u
         USING identity.auth a
         WHERE a.user_id = u.id
           AND a.is_verified = false
           AND a.unverified_expires_at < now()
         RETURNING u.profile_picture AS "profilePicture"`,
        );
        return rows
            .map((r) => r.profilePicture)
            .filter((p): p is string => p !== null);
    },

    verifyByToken: async (token, client) => {
        const { rows } = await getExecutor(client).query<{
            userId: string;
            email: string;
            username: string;
        }>(
            `WITH verified AS (
             UPDATE identity.auth
             SET is_verified = true,
                 verification_token = NULL,
                 verification_token_expiry = NULL,
                 unverified_expires_at = NULL
             WHERE verification_token = $1
               AND verification_token_expiry > now()
               AND is_verified = false
             RETURNING user_id
         )
         SELECT u.id AS "userId", u.email, u.username
         FROM verified v
         JOIN identity.users u ON u.id = v.user_id`,
            [token],
        );
        return rows[0] ?? null;
    },

    refreshVerificationTokenByUserId: async (
        userId,
        token,
        tokenExpiry,
        client,
    ) => {
        const { rows } = await getExecutor(client).query<{
            email: string;
            username: string;
        }>(
            `WITH refreshed AS (
             UPDATE identity.auth
             SET verification_token = $2,
                 verification_token_expiry = $3
             WHERE user_id = $1
               AND is_verified = false
             RETURNING user_id
         )
         SELECT u.email, u.username
         FROM refreshed r
         JOIN identity.users u ON u.id = r.user_id`,
            [userId, token, tokenExpiry],
        );
        return rows[0] ?? null;
    },

    findLoginByEmail: async (email, client) => {
        const { rows } = await getExecutor(client).query<{
            userId: string;
            email: string;
            username: string;
            passwordHash: string | null;
            isVerified: boolean | null;
        }>(
            `SELECT u.id            AS "userId",
                u.email,
                u.username,
                a.password_hash AS "passwordHash",
                a.is_verified   AS "isVerified"
         FROM identity.users u
         LEFT JOIN identity.auth a ON a.user_id = u.id
         WHERE u.email = $1`,
            [email],
        );
        return rows[0] ?? null;
    },

    markLogin: async (userId, client) => {
        await getExecutor(client).query(
            `UPDATE identity.auth
         SET is_online = true, last_login = now()
         WHERE user_id = $1`,
            [userId],
        );
    },
};

export default authRepository;
