const UNIQUE_VIOLATION = "23505";

export interface PgUniqueViolation {
    code: typeof UNIQUE_VIOLATION;
    constraint?: string;
}

export const isUniqueViolation = (error: unknown): error is PgUniqueViolation =>
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION;
