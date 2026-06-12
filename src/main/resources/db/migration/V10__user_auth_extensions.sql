-- Extend users for email-or-phone auth
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN phone VARCHAR(20),
    ADD COLUMN phone_verified_at TIMESTAMPTZ,
    ADD COLUMN email_verified_at TIMESTAMPTZ,
    ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN locked_until TIMESTAMPTZ;

ALTER TABLE users
    ADD CONSTRAINT chk_users_email_or_phone
    CHECK (email IS NOT NULL OR phone IS NOT NULL);

DROP INDEX IF EXISTS uq_users_email_active;
CREATE UNIQUE INDEX uq_users_email_active
    ON users (LOWER(email)) WHERE deleted_at IS NULL AND email IS NOT NULL;

CREATE UNIQUE INDEX uq_users_phone_active
    ON users (phone) WHERE deleted_at IS NULL AND phone IS NOT NULL;

CREATE INDEX idx_users_phone ON users (phone) WHERE deleted_at IS NULL;

UPDATE users u
SET phone = c.phone
FROM customers c
WHERE c.user_id = u.id
  AND u.phone IS NULL
  AND c.phone IS NOT NULL
  AND c.deleted_at IS NULL;

-- Allow phone-only customer profiles
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;

DROP INDEX IF EXISTS uq_customers_email_active;
CREATE UNIQUE INDEX uq_customers_email_active
    ON customers (LOWER(email)) WHERE deleted_at IS NULL AND email IS NOT NULL;

CREATE UNIQUE INDEX uq_customers_phone_active
    ON customers (phone) WHERE deleted_at IS NULL AND phone IS NOT NULL;

ALTER TABLE customers
    ADD CONSTRAINT chk_customers_email_or_phone
    CHECK (email IS NOT NULL OR phone IS NOT NULL);
