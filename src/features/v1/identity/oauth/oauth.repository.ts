import { getExecutor } from "../../../../common/utils/database/dbExecutor";
import type { IOAuthRepository } from "./repository/oauth.interface.repository";

const oauthRepository: IOAuthRepository = {
    findUserByGoogleId: async (googleId, client) => {
        const { rows } = await getExecutor(client).query<{ userId: string }>(
            `SELECT user_id AS "userId"
             FROM identity.oauth
             WHERE provider = 'google' AND provider_user_id = $1`,
            [googleId],
        );
        return rows[0]?.userId ?? null;
    },

    markLogin: async (userId, client) => {
        await getExecutor(client).query(
            `UPDATE identity.oauth
             SET is_online = true, last_login = now()
             WHERE user_id = $1`,
            [userId],
        );
    },

    create: async (userId, googleId, client) => {
        await getExecutor(client).query(
            `INSERT INTO identity.oauth (user_id, provider_user_id, is_online, last_login)
             VALUES ($1, $2, true, now())`,
            [userId, googleId],
        );
    },

    markLogout: async (userId, client) => {
        await getExecutor(client).query(
            `UPDATE identity.oauth
             SET is_online = false, last_logout = now()
             WHERE user_id = $1`,
            [userId],
        );
    },
};

export default oauthRepository;
