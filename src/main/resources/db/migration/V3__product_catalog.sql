CREATE TABLE products (
    id              UUID PRIMARY KEY,
    sku             VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(300) NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'INR',
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    CONSTRAINT chk_product_status CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED'))
);

CREATE TABLE product_images (
    id              UUID PRIMARY KEY,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(300),
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

CREATE TABLE product_category (
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_category_category ON product_category(category_id);
