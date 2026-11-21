import type { IUser } from "./types/user.interface";
import type { IUserRepository } from "./repository/user.interface.repository";
import { getExecutor } from "../../../../common/utils/database/dbExecutor";

const USER_COLUMNS = `
    id,
    login_method     AS "loginMethod",
    username,
    email,
    contact_number   AS "contactNumber",
    givenname,
    surname,
    gender,
    address,
    birthdate,
    profile_picture  AS "profilePicture",
    created_at       AS "createdAt",
    updated_at       AS "updatedAt"
`;

const UPDATABLE_COLUMNS: Record<string, string> = {
    username: "username",
    givenname: "givenname",
    surname: "surname",
    gender: "gender",
    birthdate: "birthdate",
    contactNumber: "contact_number",
    address: "address",
};

const userRepository: IUserRepository = {
    findExistingUsername: async (username, client) => {
        const { rows } = await getExecutor(client).query<{ exists: boolean }>(
            "SELECT EXISTS (SELECT 1 FROM identity.users WHERE username = $1) AS exists",
            [username],
        );
        return rows[0].exists;
    },

    findExistingContactNumber: async (contactNumber, client) => {
        const { rows } = await getExecutor(client).query<{ exists: boolean }>(
            "SELECT EXISTS (SELECT 1 FROM identity.users WHERE contact_number = $1) AS exists",
            [contactNumber],
        );
        return rows[0].exists;
    },

    findExistingEmail: async (email, client) => {
        const { rows } = await getExecutor(client).query<{ exists: boolean }>(
            "SELECT EXISTS (SELECT 1 FROM identity.users WHERE email = $1) AS exists",
            [email],
        );
        return rows[0].exists;
    },

    create: async (data, client) => {
        const { rows } = await getExecutor(client).query<IUser>(
            `INSERT INTO identity.users
                (login_method, username, email, contact_number, givenname,
                 surname, gender, address, birthdate, profile_picture)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING ${USER_COLUMNS}`,
            [
                data.loginMethod,
                data.username,
                data.email,
                data.contactNumber,
                data.givenname,
                data.surname,
                data.gender,
                data.address,
                data.birthdate,
                data.profilePicture,
            ],
        );
        return rows[0];
    },

    findById: async (id, client) => {
        const { rows } = await getExecutor(client).query<IUser>(
            `SELECT ${USER_COLUMNS}
         FROM identity.users
         WHERE id = $1`,
            [id],
        );
        return rows[0] ?? null;
    },

    updateById: async (id, data, client) => {
        const sets: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            const column = UPDATABLE_COLUMNS[key];
            if (column === undefined || value === undefined) continue;
            values.push(value);
            sets.push(`${column} = $${values.length}`);
        }

        if (sets.length === 0) return null;

        values.push(id);
        const { rows } = await getExecutor(client).query<IUser>(
            `UPDATE identity.users
         SET ${sets.join(", ")}
         WHERE id = $${values.length}
         RETURNING ${USER_COLUMNS}`,
            values,
        );
        return rows[0] ?? null;
    },

    isUsernameTakenByOther: async (username, userId, client) => {
        const { rows } = await getExecutor(client).query<{ exists: boolean }>(
            "SELECT EXISTS (SELECT 1 FROM identity.users WHERE username = $1 AND id <> $2) AS exists",
            [username, userId],
        );
        return rows[0].exists;
    },

    isContactNumberTakenByOther: async (contactNumber, userId, client) => {
        const { rows } = await getExecutor(client).query<{ exists: boolean }>(
            "SELECT EXISTS (SELECT 1 FROM identity.users WHERE contact_number = $1 AND id <> $2) AS exists",
            [contactNumber, userId],
        );
        return rows[0].exists;
    },

    updatePicture: async (id, path, client) => {
        const { rows } = await getExecutor(client).query<{
            oldPicture: string | null;
        }>(
            `WITH old AS (
             SELECT profile_picture FROM identity.users WHERE id = $1
         ),
         updated AS (
             UPDATE identity.users SET profile_picture = $2 WHERE id = $1
             RETURNING id
         )
         SELECT old.profile_picture AS "oldPicture"
         FROM old JOIN updated ON true`,
            [id, path],
        );
        return rows[0]?.oldPicture ?? null;
    },
};

export default userRepository;
