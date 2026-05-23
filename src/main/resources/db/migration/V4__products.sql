CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    compare_at_price NUMERIC(12,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    fabric_id UUID REFERENCES fabrics(id) ON DELETE RESTRICT,
    print_id UUID REFERENCES prints(id) ON DELETE RESTRICT,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_product_status CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED'))
);
CREATE UNIQUE INDEX uq_products_sku_active ON products (sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_fabric ON products (fabric_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_print ON products (print_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_search_vector ON products USING GIN (search_vector);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(300),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);

CREATE TABLE product_tags (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, category_id)
);

CREATE TABLE product_seasonal_collections (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seasonal_collection_id UUID NOT NULL REFERENCES seasonal_collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, seasonal_collection_id)
);

CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.name,'')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description,'')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.sku,'')), 'A');
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_search_vector BEFORE INSERT OR UPDATE OF name, description, sku ON products
    FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_product_images_updated_at BEFORE UPDATE ON product_images FOR EACH ROW EXECUTE FUNCTION set_updated_at();
