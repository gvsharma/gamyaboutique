-- Women & Girls boutique taxonomy: deactivate legacy roots, add girls + blouses, reassign misplaced products.

-- Deactivate legacy roots and out-of-scope categories
UPDATE categories
SET active = FALSE, updated_at = NOW()
WHERE deleted_at IS NULL
  AND active = TRUE
  AND (
    slug IN ('men', 'kids', 'bridal', 'festive', 'sherwanis', 'kids-ethnic')
    OR path IN ('/men', '/kids', '/women/bridal', '/women/festive', '/men/sherwanis', '/kids/ethnic')
  );

-- Girls root (replaces Kids in storefront)
INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Girls', 'girls', 'Girls ethnic wear', NULL, '/girls', 0, 2, TRUE, 'migration', 'migration'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'girls' AND parent_id IS NULL AND deleted_at IS NULL
);

-- Blouses under Women
INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Blouses', 'blouses', 'Designer blouses', w.id, '/women/blouses', 1, 4, TRUE, 'migration', 'migration'
FROM categories w
WHERE w.slug = 'women' AND w.parent_id IS NULL AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.path = '/women/blouses' AND c.deleted_at IS NULL
  );

-- Girls Kurtas
INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Girls Kurtas', 'girls-kurtas', 'Girls kurtas and frocks', g.id, '/girls/girls-kurtas', 1, 1, TRUE, 'migration', 'migration'
FROM categories g
WHERE g.slug = 'girls' AND g.parent_id IS NULL AND g.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.path = '/girls/girls-kurtas' AND c.deleted_at IS NULL
  );

-- Girls Lehengas
INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Girls Lehengas', 'girls-lehengas', 'Girls lehenga sets', g.id, '/girls/girls-lehengas', 1, 2, TRUE, 'migration', 'migration'
FROM categories g
WHERE g.slug = 'girls' AND g.parent_id IS NULL AND g.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.path = '/girls/girls-lehengas' AND c.deleted_at IS NULL
  );

-- Move kids-ethnic products to girls-kurtas
UPDATE products p
SET category_id = gk.id, updated_at = NOW()
FROM categories ke, categories gk
WHERE p.category_id = ke.id
  AND ke.slug = 'kids-ethnic'
  AND ke.deleted_at IS NULL
  AND gk.path = '/girls/girls-kurtas'
  AND gk.deleted_at IS NULL;

UPDATE product_categories pc
SET category_id = gk.id
FROM categories ke, categories gk
WHERE pc.category_id = ke.id
  AND ke.slug = 'kids-ethnic'
  AND ke.deleted_at IS NULL
  AND gk.path = '/girls/girls-kurtas'
  AND gk.deleted_at IS NULL;

-- Move bridal/festive products to nearest women leaf
UPDATE products p
SET category_id = leh.id, updated_at = NOW()
FROM categories src, categories leh
WHERE p.category_id = src.id
  AND src.slug IN ('bridal', 'festive')
  AND src.deleted_at IS NULL
  AND leh.path = '/women/lehengas'
  AND leh.deleted_at IS NULL;

UPDATE product_categories pc
SET category_id = leh.id
FROM categories src, categories leh
WHERE pc.category_id = src.id
  AND src.slug IN ('bridal', 'festive')
  AND src.deleted_at IS NULL
  AND leh.path = '/women/lehengas'
  AND leh.deleted_at IS NULL;

-- Products assigned only to Women root → default to Sarees so they appear in storefront
UPDATE products p
SET category_id = sarees.id, updated_at = NOW()
FROM categories women, categories sarees
WHERE p.category_id = women.id
  AND women.slug = 'women'
  AND women.parent_id IS NULL
  AND women.deleted_at IS NULL
  AND sarees.path = '/women/sarees'
  AND sarees.deleted_at IS NULL;

UPDATE product_categories pc
SET category_id = sarees.id
FROM categories women, categories sarees
WHERE pc.category_id = women.id
  AND women.slug = 'women'
  AND women.parent_id IS NULL
  AND women.deleted_at IS NULL
  AND sarees.path = '/women/sarees'
  AND sarees.deleted_at IS NULL;

-- Ensure women leaf categories stay active
UPDATE categories
SET active = TRUE, updated_at = NOW()
WHERE deleted_at IS NULL
  AND path IN ('/women', '/women/sarees', '/women/kurtas', '/women/lehengas', '/women/blouses', '/girls', '/girls/girls-kurtas', '/girls/girls-lehengas');
