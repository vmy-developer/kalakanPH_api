-- Up Migration

CREATE TYPE identity.oauth_provider AS ENUM ('google');

CREATE TABLE identity.oauth (
    id                  uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid                    NOT NULL UNIQUE,
    login_method        identity.login_method   NOT NULL DEFAULT 'oauth'
                            CHECK (login_method = 'oauth'),
    provider            identity.oauth_provider NOT NULL DEFAULT 'google',
    provider_user_id    text                    NOT NULL,
    is_online           boolean                 NOT NULL DEFAULT false,
    last_login          timestamptz,
    last_logout         timestamptz,
    created_at          timestamptz             NOT NULL DEFAULT now(),
    updated_at          timestamptz             NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_user_id),
    FOREIGN KEY (user_id, login_method)
        REFERENCES identity.users (id, login_method) ON DELETE CASCADE
);

CREATE TRIGGER oauth_set_updated_at
    BEFORE UPDATE ON identity.oauth
    FOR EACH ROW EXECUTE FUNCTION identity.set_updated_at();

ALTER TABLE identity.oauth ENABLE ROW LEVEL SECURITY;


-- Down Migration

DROP TABLE IF EXISTS identity.oauth;
DROP TYPE IF EXISTS identity.oauth_provider;