CREATE TABLE customer_interest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_customer_interest_status CHECK (status IN ('NEW','CONTACTED','QUALIFIED','CONVERTED','CLOSED'))
);

CREATE TABLE manual_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    notes TEXT, placed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_manual_orders_number ON manual_orders (order_number) WHERE deleted_at IS NULL;

CREATE TABLE manual_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_order_id UUID NOT NULL REFERENCES manual_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);
CREATE TRIGGER trg_customer_interest_updated_at BEFORE UPDATE ON customer_interest FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_manual_orders_updated_at BEFORE UPDATE ON manual_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
