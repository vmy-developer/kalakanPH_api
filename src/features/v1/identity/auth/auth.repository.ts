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
};

export default authRepository;
