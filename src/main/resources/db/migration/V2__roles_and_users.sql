CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_role_code CHECK (code IN ('ADMIN', 'STAFF', 'CUSTOMER'))
);
CREATE UNIQUE INDEX uq_roles_code_active ON roles (code) WHERE deleted_at IS NULL;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_users_email_active ON users (email) WHERE deleted_at IS NULL;

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_role ON user_roles (role_id);

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO roles (id, code, name, description, created_by, updated_by) VALUES
    ('10000000-0000-0000-0000-000000000001', 'ADMIN', 'Administrator', 'Full system access', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000002', 'STAFF', 'Staff', 'Boutique staff', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000003', 'CUSTOMER', 'Customer', 'Registered customer', 'system', 'system');
