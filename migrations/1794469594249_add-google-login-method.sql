-- Up Migration
ALTER TYPE identity.login_method ADD VALUE IF NOT EXISTS 'oauth';

-- Down Migration
-- Postgres cannot remove enum values; intentionally left empty.