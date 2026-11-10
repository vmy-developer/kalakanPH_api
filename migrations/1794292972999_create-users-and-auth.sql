-- Up Migration

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TYPE identity.user_gender  AS ENUM ('male', 'female', 'prefer_not_to_say');
CREATE TYPE identity.login_method AS ENUM ('local');

CREATE OR REPLACE FUNCTION identity.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users: who the person is
CREATE TABLE identity.users (
    id                  uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
    login_method        identity.login_method   NOT NULL,
    username            varchar(15)             NOT NULL UNIQUE,
    email               extensions.citext       NOT NULL UNIQUE,
    contact_number      varchar(13)             NOT NULL UNIQUE,
    givenname           varchar(15)             NOT NULL,
    surname             varchar(15)             NOT NULL,
    gender              identity.user_gender    NOT NULL DEFAULT 'prefer_not_to_say',
    address             text                    NOT NULL,
    birthdate           date                    NOT NULL,
    profile_picture     text,
    created_at          timestamptz             NOT NULL DEFAULT now(),
    updated_at          timestamptz             NOT NULL DEFAULT now(),
    UNIQUE (id, login_method)
);

-- auth: password login
CREATE TABLE identity.auth (
    id                              uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                         uuid                    NOT NULL UNIQUE,
    login_method                    identity.login_method   NOT NULL DEFAULT 'local'
                                        CHECK (login_method = 'local'),
    password_hash                   varchar(72)             NOT NULL,
    is_online                       boolean                 NOT NULL DEFAULT false,
    last_login                      timestamptz,
    last_logout                     timestamptz,
    is_verified                     boolean                 NOT NULL DEFAULT false,
    unverified_expires_at           timestamptz,
    verification_token              text,
    verification_token_expiry       timestamptz,
    created_at                      timestamptz             NOT NULL DEFAULT now(),
    updated_at                      timestamptz             NOT NULL DEFAULT now(),
    FOREIGN KEY (user_id, login_method)
        REFERENCES identity.users (id, login_method) ON DELETE CASCADE
);

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON identity.users
    FOR EACH ROW EXECUTE FUNCTION identity.set_updated_at();

CREATE TRIGGER auth_set_updated_at
    BEFORE UPDATE ON identity.auth
    FOR EACH ROW EXECUTE FUNCTION identity.set_updated_at();

CREATE INDEX idx_auth_verification_token
    ON identity.auth (verification_token)
    WHERE verification_token IS NOT NULL;

CREATE INDEX idx_auth_unverified_expires
    ON identity.auth (unverified_expires_at)
    WHERE is_verified = false;

ALTER TABLE identity.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.auth  ENABLE ROW LEVEL SECURITY;


-- Down Migration

DROP TABLE IF EXISTS identity.auth;
DROP TABLE IF EXISTS identity.users;
DROP FUNCTION IF EXISTS identity.set_updated_at();
DROP TYPE IF EXISTS identity.login_method;
DROP TYPE IF EXISTS identity.user_gender;
DROP SCHEMA IF EXISTS identity;