-- Up Migration

CREATE INDEX idx_users_username_lower  ON identity.users (lower(username)  text_pattern_ops);
CREATE INDEX idx_users_givenname_lower ON identity.users (lower(givenname) text_pattern_ops);
CREATE INDEX idx_users_surname_lower   ON identity.users (lower(surname)   text_pattern_ops);


-- Down Migration

DROP INDEX IF EXISTS identity.idx_users_surname_lower;
DROP INDEX IF EXISTS identity.idx_users_givenname_lower;
DROP INDEX IF EXISTS identity.idx_users_username_lower;