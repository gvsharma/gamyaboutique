CREATE TABLE product_interests (
    id              UUID PRIMARY KEY,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30) NOT NULL,
    message         TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

CREATE INDEX idx_product_interests_product ON product_interests(product_id);
CREATE INDEX idx_product_interests_created ON product_interests(created_at);
