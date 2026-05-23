CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories (id) ON DELETE RESTRICT,
    path VARCHAR(1000) NOT NULL,
    depth INT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_categories_parent_slug_active ON categories (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_path ON categories (path text_pattern_ops) WHERE deleted_at IS NULL;

CREATE TABLE fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    composition VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_fabrics_slug_active ON fabrics (slug) WHERE deleted_at IS NULL;

CREATE TABLE prints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    pattern_type VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_prints_slug_active ON prints (slug) WHERE deleted_at IS NULL;

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    tag_type VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_tag_type CHECK (tag_type IN ('GENERAL','OFFER','SEASONAL','FEATURE','COLLECTION'))
);
CREATE UNIQUE INDEX uq_tags_slug_active ON tags (slug) WHERE deleted_at IS NULL;

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(12,2) NOT NULL,
    starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_offer_discount_type CHECK (discount_type IN ('PERCENT','FIXED'))
);

CREATE TABLE seasonal_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    season VARCHAR(30) NOT NULL,
    year INT NOT NULL,
    description TEXT,
    starts_at DATE, ends_at DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255), updated_by VARCHAR(255), deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_seasonal_slug_active ON seasonal_collections (slug) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fabrics_updated_at BEFORE UPDATE ON fabrics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prints_updated_at BEFORE UPDATE ON prints FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_seasonal_updated_at BEFORE UPDATE ON seasonal_collections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
