CREATE TABLE promo_videos (
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

CREATE INDEX idx_promo_videos_active_order ON promo_videos (active, display_order);

CREATE TRIGGER trg_promo_videos_updated_at
    BEFORE UPDATE ON promo_videos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
