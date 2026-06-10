CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    refresh_token_hash  VARCHAR(255) NOT NULL,
    remember_me         BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent          VARCHAR(500),
    ip_address          VARCHAR(45),
    expires_at          TIMESTAMPTZ NOT NULL,
    revoked_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_user_sessions_token ON user_sessions (refresh_token_hash);
CREATE INDEX idx_user_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_password_reset_user ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens (expires_at) WHERE used_at IS NULL;

CREATE TABLE otp_verifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel      VARCHAR(20) NOT NULL,
    destination  VARCHAR(255) NOT NULL,
    purpose      VARCHAR(50) NOT NULL,
    otp_hash     VARCHAR(255) NOT NULL,
    attempts     INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    expires_at   TIMESTAMPTZ NOT NULL,
    verified_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_otp_channel CHECK (channel IN ('EMAIL', 'SMS', 'WHATSAPP')),
    CONSTRAINT chk_otp_purpose CHECK (purpose IN ('PASSWORD_RESET', 'LOGIN', 'VERIFY_PHONE', 'VERIFY_EMAIL'))
);
CREATE INDEX idx_otp_destination ON otp_verifications (destination, purpose) WHERE verified_at IS NULL;

CREATE TABLE login_attempts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    success    BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_login_attempts_identifier_time ON login_attempts (identifier, created_at DESC);

CREATE TRIGGER trg_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
