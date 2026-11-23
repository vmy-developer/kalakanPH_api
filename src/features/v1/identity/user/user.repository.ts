import type {
    IUser,
    UniqueField,
    UserSearchResult,
} from "./types/user.interface";
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

const UNIQUE_COLUMNS: ReadonlyArray<readonly [UniqueField, string]> = [
    ["username", "username"],
    ["email", "email"],
    ["contactNumber", "contact_number"],
];

const userRepository: IUserRepository = {
    findConflicts: async (fields, excludeId, client) => {
        const checks = UNIQUE_COLUMNS.filter(
            ([key]) => fields[key] !== undefined,
        );
        if (checks.length === 0) return [];

        const values: unknown[] = checks.map(([key]) => fields[key]);
        const matches = checks.map(([, column], i) => `${column} = $${i + 1}`);

        let exclusion = "";
        if (excludeId !== undefined) {
            values.push(excludeId);
            exclusion = ` AND id <> $${values.length}`;
        }

        const { rows } = await getExecutor(client).query<
            Record<string, boolean>
        >(
            `SELECT ${checks
                .map(
                    ([key, column], i) =>
                        `COALESCE(bool_or(${column} = $${i + 1}), false) AS "${key}"`,
                )
                .join(", ")}
             FROM identity.users
             WHERE (${matches.join(" OR ")})${exclusion}`,
            values,
        );

        return checks.filter(([key]) => rows[0][key]).map(([key]) => key);
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

    search: async (query, excludeUserId, limit, offset, client) => {
        // Escape LIKE wildcards so users can't inject % or _
        const escaped = query.toLowerCase().replace(/[\\%_]/g, "\\$&");
        const pattern = `${escaped}%`;

        const { rows } = await getExecutor(client).query<UserSearchResult>(
            `SELECT username,
                givenname,
                surname,
                profile_picture AS "profilePicture"
         FROM identity.users
         WHERE id <> $2
           AND (lower(username)  LIKE $1
             OR lower(givenname) LIKE $1
             OR lower(surname)   LIKE $1)
         ORDER BY lower(username)
         LIMIT $3 OFFSET $4`,
            [pattern, excludeUserId, limit, offset],
        );
        return rows;
    },

    findByUsername: async (username, client) => {
        const { rows } = await getExecutor(client).query<IUser>(
            `SELECT ${USER_COLUMNS} FROM identity.users WHERE username = $1`,
            [username],
        );
        return rows[0] ?? null;
    },

    deleteById: async (id, client) => {
        const { rows } = await getExecutor(client).query<{
            profilePicture: string | null;
        }>(
            `DELETE FROM identity.users
         WHERE id = $1
         RETURNING profile_picture AS "profilePicture"`,
            [id],
        );
        return rows.length === 0 ? undefined : rows[0].profilePicture;
    },
};

export default userRepository;
