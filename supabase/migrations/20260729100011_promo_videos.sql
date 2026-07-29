CREATE TABLE IF NOT EXISTS promo_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    poster_url VARCHAR(500),
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_promo_videos_active_order ON promo_videos (active, display_order);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_promo_videos_updated_at'
    ) THEN
        CREATE TRIGGER trg_promo_videos_updated_at
            BEFORE UPDATE ON promo_videos
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
