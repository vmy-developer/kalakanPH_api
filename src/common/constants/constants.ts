export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

// Auth / tokens
export const SESSION_TTL_MS = DAY_MS;
export const SIGNUP_TOKEN_TTL_MS = 10 * MINUTE_MS;
export const VERIFICATION_TOKEN_TTL_MS = 15 * MINUTE_MS;
export const UNVERIFIED_ACCOUNT_TTL_MS = DAY_MS;
export const BCRYPT_ROUNDS = 10;

// Profile
export const PH_COUNTRY_CODE = "+63";
export const MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024;
export const PROFILE_PICTURE_URL_TTL_SECONDS = 60 * 60;

// Background jobs
export const CLEANUP_INTERVAL_MS = HOUR_MS;
