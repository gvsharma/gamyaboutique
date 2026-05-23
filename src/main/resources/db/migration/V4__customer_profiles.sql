CREATE TABLE customers (
    id              UUID PRIMARY KEY,
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user ON customers(user_id);
