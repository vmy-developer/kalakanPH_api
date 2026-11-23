import type { PoolClient } from "pg";
import { ConflictError } from "../../../../../common/error/errorStatusCode";
import { isUniqueViolation } from "../../../../../common/utils/database/pgErrors";
import userRepository from "../user.repository";
import type { UniqueField, UniqueFields } from "./user.interface";

const MESSAGES: Record<UniqueField, string> = {
    username: "Username already exists",
    email: "Email already exists",
    contactNumber: "Contact number already exists",
};

const DEFAULT_RACE_MESSAGE = "Username, email or contact number already exists";

/**
 * Throws ConflictError for the first taken field (username, email, contact
 * number). Pass `excludeId` when updating an existing user. The DB unique
 * constraints stay as the race-safe backstop, see `mapUniqueViolation`.
 */
export const assertUserUnique = async (
    fields: UniqueFields,
    options: { excludeId?: string; client?: PoolClient } = {},
): Promise<void> => {
    const [first] = await userRepository.findConflicts(
        fields,
        options.excludeId,
        options.client,
    );
    if (first) throw new ConflictError(MESSAGES[first]);
};

/**
 * Use in a catch block: `throw mapUniqueViolation(error)`. Turns a Postgres
 * unique violation (23505) into a ConflictError, using the constraint name to
 * say which field clashed when it can; any other error passes through.
 */
export const mapUniqueViolation = (
    error: unknown,
    fallback = DEFAULT_RACE_MESSAGE,
): unknown => {
    if (!isUniqueViolation(error)) return error;

    const constraint = error.constraint ?? "";
    if (constraint.includes("username"))
        return new ConflictError(MESSAGES.username);
    if (constraint.includes("email")) return new ConflictError(MESSAGES.email);
    if (constraint.includes("contact"))
        return new ConflictError(MESSAGES.contactNumber);
    return new ConflictError(fallback);
};
