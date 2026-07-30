-- Homepage merchandising slots (Phase B): admin-curated featured collection and product edit.

CREATE TABLE homepage_slots (
    slot_key VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200),
    subtitle VARCHAR(500),
    body TEXT,
    image_url VARCHAR(500),
    collection_slug VARCHAR(120),
    product_ids JSONB,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO homepage_slots (slot_key, title, subtitle, active)
VALUES
    ('FEATURED_COLLECTION', NULL, NULL, TRUE),
    ('CURATED_EDIT', 'Editor''s pick', 'Pieces we love this season', TRUE);
