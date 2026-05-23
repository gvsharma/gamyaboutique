CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    first_name VARCHAR(100), last_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_customers_email_active ON customers (email) WHERE deleted_at IS NULL;

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL DEFAULT 'SHIPPING',
    line1 VARCHAR(300) NOT NULL, line2 VARCHAR(300),
    city VARCHAR(100) NOT NULL, state VARCHAR(100),
    postal_code VARCHAR(20), country VARCHAR(2) NOT NULL DEFAULT 'IN',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_address_type CHECK (address_type IN ('SHIPPING','BILLING','OTHER'))
);
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
