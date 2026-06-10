ALTER TABLE products
    ADD COLUMN stock_quantity INT,
    ADD COLUMN low_stock_threshold INT DEFAULT 5;

CREATE TABLE carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    guest_token UUID,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_cart_owner CHECK (customer_id IS NOT NULL OR guest_token IS NOT NULL),
    CONSTRAINT chk_cart_status CHECK (status IN ('ACTIVE', 'MERGED', 'ABANDONED'))
);
CREATE UNIQUE INDEX uq_carts_customer_active
    ON carts (customer_id) WHERE deleted_at IS NULL AND status = 'ACTIVE' AND customer_id IS NOT NULL;
CREATE UNIQUE INDEX uq_carts_guest_active
    ON carts (guest_token) WHERE deleted_at IS NULL AND status = 'ACTIVE' AND guest_token IS NOT NULL;

CREATE TABLE cart_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id        UUID NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
    quantity       INT NOT NULL DEFAULT 1,
    selected_size  VARCHAR(50),
    selected_color VARCHAR(50),
    added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_item_qty CHECK (quantity > 0)
);
CREATE UNIQUE INDEX uq_cart_items_product_variant
    ON cart_items (cart_id, product_id, COALESCE(selected_size, ''), COALESCE(selected_color, ''));

CREATE TABLE wishlist_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_wishlist_customer_product
    ON wishlist_items (customer_id, product_id) WHERE deleted_at IS NULL;

CREATE TABLE recently_viewed_products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_recently_viewed ON recently_viewed_products (customer_id, product_id);
CREATE INDEX idx_recently_viewed_customer_time ON recently_viewed_products (customer_id, viewed_at DESC);

CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
