-- Category cover images + backfill missing product photos (category-aware Unsplash placeholders).

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

COMMENT ON COLUMN categories.image_url IS 'Hero/cover image URL for category pages and navigation';

-- Category cover images by slug / name pattern
UPDATE categories
SET image_url = CASE
    WHEN slug IN (
        'sarees', 'silk-sarees', 'cotton-sarees', 'party-wear-sarees',
        'wedding-sarees', 'daily-wear-sarees'
    ) OR slug LIKE '%saree%' OR lower(name) LIKE '%saree%'
        THEN 'https://images.unsplash.com/photo-1610030469983-98e550b19538?w=1200&q=80'
    WHEN slug IN (
        'lehengas', 'bridal-lehengas', 'party-wear-lehengas', 'festive-lehengas',
        'girls-lehengas', 'girls-lehenga-sets', 'bridal', 'festive-lehengas'
    ) OR slug LIKE '%lehenga%' OR lower(name) LIKE '%lehenga%'
        THEN 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80'
    WHEN slug IN ('kurtas', 'kurti', 'kurtis') OR slug LIKE '%kurt%' OR lower(name) LIKE '%kurt%'
        THEN 'https://images.unsplash.com/photo-1617627143750-d86bc21e3273?w=1200&q=80'
    WHEN slug IN ('blouses', 'blouse') OR slug LIKE '%blouse%' OR lower(name) LIKE '%blouse%'
        THEN 'https://images.unsplash.com/photo-1572804013309-59a23b2e4c1f?w=1200&q=80'
    WHEN slug IN (
        'frocks', 'girls-collection', 'girls-festival-wear', 'birthday-specials',
        'mom-daughter-sets', 'kids-ethnic', 'kids'
    ) OR slug LIKE '%girl%' OR slug LIKE '%frock%' OR slug LIKE '%kid%'
        OR lower(name) LIKE '%frock%' OR lower(name) LIKE '%girl%'
        THEN 'https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=1200&q=80'
    WHEN slug LIKE '%sherwani%' OR slug = 'men'
        THEN 'https://images.unsplash.com/photo-1620799140408-8747d1d90e59?w=1200&q=80'
    WHEN slug IN ('women', 'festive', 'new-arrivals')
        THEN 'https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80'
    ELSE 'https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80'
END
WHERE deleted_at IS NULL
  AND (image_url IS NULL OR trim(image_url) = '');

-- Products missing any image: assign by category slug, then product name
INSERT INTO product_images (id, product_id, url, alt_text, display_order, created_by, updated_by)
SELECT
    gen_random_uuid(),
    p.id,
    CASE
        WHEN c.slug LIKE '%saree%' OR lower(p.name) LIKE '%saree%'
            THEN 'https://images.unsplash.com/photo-1610030469983-98e550b19538?w=800&q=80'
        WHEN c.slug LIKE '%lehenga%' OR lower(p.name) LIKE '%lehenga%'
            THEN 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
        WHEN c.slug LIKE '%kurt%' OR lower(p.name) LIKE '%kurta%' OR lower(p.name) LIKE '%kurti%'
            THEN 'https://images.unsplash.com/photo-1617627143750-d86bc21e3273?w=800&q=80'
        WHEN c.slug LIKE '%blouse%' OR lower(p.name) LIKE '%blouse%'
            THEN 'https://images.unsplash.com/photo-1572804013309-59a23b2e4c1f?w=800&q=80'
        WHEN c.slug LIKE '%frock%' OR c.slug LIKE '%girl%' OR c.slug LIKE '%kid%'
            OR lower(p.name) LIKE '%frock%' OR lower(p.name) LIKE '%girl%'
            THEN 'https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=800&q=80'
        WHEN c.slug LIKE '%sherwani%' OR lower(p.name) LIKE '%sherwani%'
            THEN 'https://images.unsplash.com/photo-1620799140408-8747d1d90e59?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=800&q=80'
    END,
    p.name,
    0,
    'migration',
    'migration'
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM product_images pi
      WHERE pi.product_id = p.id
        AND pi.deleted_at IS NULL
  );
