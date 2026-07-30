-- Extend seasonal_collections for event/trend merchandising (Collections admin).

ALTER TABLE seasonal_collections
    ADD COLUMN IF NOT EXISTS collection_type VARCHAR(30) NOT NULL DEFAULT 'SEASON',
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

UPDATE seasonal_collections
SET collection_type = 'SEASON'
WHERE collection_type IS NULL OR collection_type = '';

ALTER TABLE seasonal_collections
    DROP CONSTRAINT IF EXISTS chk_seasonal_collection_type;

ALTER TABLE seasonal_collections
    ADD CONSTRAINT chk_seasonal_collection_type
        CHECK (collection_type IN ('EVENT', 'TREND', 'SEASON', 'FEATURED'));
