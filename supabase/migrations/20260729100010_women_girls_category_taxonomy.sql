-- Mirror Flyway V21: Women & Girls taxonomy including blouses (required for admin product type dropdown).

UPDATE categories
SET active = FALSE, updated_at = NOW()
WHERE deleted_at IS NULL
  AND active = TRUE
  AND (
    slug IN ('men', 'kids', 'bridal', 'festive', 'sherwanis', 'kids-ethnic')
    OR path IN ('/men', '/kids', '/women/bridal', '/women/festive', '/men/sherwanis', '/kids/ethnic')
  );

INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Girls', 'girls', 'Girls ethnic wear', NULL, '/girls', 0, 2, TRUE, 'migration', 'migration'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'girls' AND parent_id IS NULL AND deleted_at IS NULL
);

INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Blouses', 'blouses', 'Designer blouses', w.id, '/women/blouses', 1, 4, TRUE, 'migration', 'migration'
FROM categories w
WHERE w.slug = 'women' AND w.parent_id IS NULL AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.path = '/women/blouses' AND c.deleted_at IS NULL
  );

INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Girls Kurtas', 'girls-kurtas', 'Girls kurtas and frocks', g.id, '/girls/girls-kurtas', 1, 1, TRUE, 'migration', 'migration'
FROM categories g
WHERE g.slug = 'girls' AND g.parent_id IS NULL AND g.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.path = '/girls/girls-kurtas' AND c.deleted_at IS NULL
  );

INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, created_by, updated_by)
SELECT gen_random_uuid(), 'Girls Lehengas', 'girls-lehengas', 'Girls lehenga sets', g.id, '/girls/girls-lehengas', 1, 2, TRUE, 'migration', 'migration'
FROM categories g
WHERE g.slug = 'girls' AND g.parent_id IS NULL AND g.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.path = '/girls/girls-lehengas' AND c.deleted_at IS NULL
  );

UPDATE categories
SET active = TRUE, updated_at = NOW()
WHERE deleted_at IS NULL
  AND path IN (
    '/women', '/women/sarees', '/women/kurtas', '/women/lehengas', '/women/blouses',
    '/girls', '/girls/girls-kurtas', '/girls/girls-lehengas'
  );
