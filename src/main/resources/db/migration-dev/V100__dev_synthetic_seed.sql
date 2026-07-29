-- Dev-only synthetic data (~10 rows per table). Idempotent: clears prior seed UUIDs then re-inserts.
-- Test user password (all seeded users): Admin@123  (same bcrypt hash as admin seed)

-- roles: schema allows only ADMIN, STAFF, CUSTOMER (3 rows from V2) — not expanded here.

-- Remove prior dev seeds (V10 + partial runs); order respects FKs
DELETE FROM customer_interest_audit_log
WHERE interest_id IN (SELECT id FROM customer_interest WHERE created_by = 'seed');
DELETE FROM customer_interest WHERE created_by = 'seed';
DELETE FROM manual_order_items
WHERE manual_order_id IN (SELECT id FROM manual_orders WHERE created_by = 'seed');
DELETE FROM manual_orders WHERE created_by = 'seed';
DELETE FROM notification_outbox WHERE created_by = 'seed';
DELETE FROM notifications WHERE created_by = 'seed';
DELETE FROM crm_leads WHERE created_by = 'seed';
DELETE FROM addresses WHERE created_by = 'seed';
DELETE FROM customers WHERE created_by = 'seed';
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE created_by = 'seed');
DELETE FROM users WHERE created_by = 'seed';
DELETE FROM product_seasonal_collections
WHERE product_id IN (SELECT id FROM products WHERE created_by = 'seed');
DELETE FROM product_tags
WHERE product_id IN (SELECT id FROM products WHERE created_by = 'seed');
DELETE FROM product_categories
WHERE product_id IN (SELECT id FROM products WHERE created_by = 'seed');
DELETE FROM product_images WHERE created_by = 'seed';
DELETE FROM products WHERE created_by = 'seed';
DELETE FROM categories WHERE created_by = 'seed';
DELETE FROM seasonal_collections WHERE created_by = 'seed';
DELETE FROM offers WHERE created_by = 'seed';
DELETE FROM tags WHERE created_by = 'seed';
DELETE FROM prints WHERE created_by = 'seed'
   OR id::text LIKE '30000000%' OR id::text LIKE '30100000%';
DELETE FROM fabrics WHERE created_by = 'seed'
   OR id::text LIKE '20000000%' OR id::text LIKE '20100000%';

-- =============================================================================
-- Catalog taxonomy (10 each)
-- =============================================================================

INSERT INTO fabrics (id, name, slug, description, composition, active, created_by, updated_by) VALUES
    ('20100000-0000-0000-0000-000000000001', 'Banarasi Silk', 'banarasi-silk', 'Luxury Banarasi silk', 'Pure silk', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000002', 'Kanjivaram Silk', 'kanjivaram-silk', 'Temple weave silk', 'Mulberry silk', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000003', 'Chanderi Cotton', 'chanderi-cotton', 'Light sheer cotton', 'Cotton silk blend', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000004', 'Georgette', 'georgette', 'Flowing georgette', 'Poly georgette', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000005', 'Organza', 'organza', 'Crisp organza', 'Silk organza', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000006', 'Linen', 'linen', 'Breathable linen', 'Pure linen', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000007', 'Tussar Silk', 'tussar-silk', 'Textured tussar', 'Tussar silk', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000008', 'Crepe', 'crepe', 'Soft crepe drape', 'Silk crepe', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000009', 'Velvet', 'velvet', 'Rich velvet', 'Cotton velvet', TRUE, 'seed', 'seed'),
    ('20100000-0000-0000-0000-000000000010', 'Brocade', 'brocade', 'Woven brocade', 'Silk brocade', TRUE, 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prints (id, name, slug, description, pattern_type, active, created_by, updated_by) VALUES
    ('30100000-0000-0000-0000-000000000001', 'Floral Jaal', 'floral-jaal', 'Floral jaal motif', 'Jaal', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000002', 'Paisley', 'paisley', 'Classic paisley', 'Paisley', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000003', 'Peacock Butta', 'peacock-butta', 'Peacock buttas', 'Butta', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000004', 'Geometric', 'geometric', 'Modern geometric', 'Geometric', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000005', 'Temple Border', 'temple-border', 'Temple border', 'Border', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000006', 'Bandhani', 'bandhani', 'Tie-dye bandhani', 'Bandhani', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000007', 'Block Print', 'block-print', 'Hand block print', 'Block', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000008', 'Checks', 'checks', 'Subtle checks', 'Check', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000009', 'Embroidered', 'embroidered', 'Thread embroidery', 'Embroidery', TRUE, 'seed', 'seed'),
    ('30100000-0000-0000-0000-000000000010', 'Solid', 'solid', 'Solid tone', 'Solid', TRUE, 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tags (id, name, slug, tag_type, created_by, updated_by) VALUES
    ('31100000-0000-0000-0000-000000000001', 'Bridal', 'bridal', 'COLLECTION', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000002', 'Festive', 'festive', 'SEASONAL', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000003', 'Handloom', 'handloom', 'FEATURE', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000004', 'Eco Friendly', 'eco-friendly', 'FEATURE', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000005', 'Best Seller', 'best-seller', 'GENERAL', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000006', 'New Arrival', 'new-arrival', 'GENERAL', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000007', 'Sale', 'sale', 'OFFER', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000008', 'Limited Edition', 'limited-edition', 'COLLECTION', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000009', 'Custom Fit', 'custom-fit', 'FEATURE', 'seed', 'seed'),
    ('31100000-0000-0000-0000-000000000010', 'Wedding Guest', 'wedding-guest', 'GENERAL', 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offers (id, name, code, description, discount_type, discount_value, starts_at, ends_at, active, created_by, updated_by) VALUES
    ('32100000-0000-0000-0000-000000000001', 'Festive 10%', 'FEST10', 'Ten percent off', 'PERCENT', 10.00, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000002', 'Flat 2000 Off', 'FLAT2K', 'Fixed discount', 'FIXED', 2000.00, NOW() - INTERVAL '3 days', NOW() + INTERVAL '14 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000003', 'Bridal 15%', 'BRIDE15', 'Bridal season', 'PERCENT', 15.00, NOW(), NOW() + INTERVAL '60 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000004', 'Clearance 25%', 'CLR25', 'Clearance', 'PERCENT', 25.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000005', 'Welcome 5%', 'WELCOME5', 'New customer', 'PERCENT', 5.00, NOW(), NOW() + INTERVAL '90 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000006', 'Staff Pick 12%', 'STAFF12', 'Staff picks', 'PERCENT', 12.00, NOW(), NOW() + INTERVAL '45 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000007', 'Monsoon 8%', 'MONSOON8', 'Monsoon sale', 'PERCENT', 8.00, NOW(), NOW() + INTERVAL '20 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000008', 'VIP 3000 Off', 'VIP3K', 'VIP flat off', 'FIXED', 3000.00, NOW(), NOW() + INTERVAL '30 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000009', 'Diwali 20%', 'DIWALI20', 'Diwali offer', 'PERCENT', 20.00, NOW(), NOW() + INTERVAL '15 days', TRUE, 'seed', 'seed'),
    ('32100000-0000-0000-0000-000000000010', 'Archive 30%', 'ARC30', 'Last season', 'PERCENT', 30.00, NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 day', FALSE, 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO seasonal_collections (id, name, slug, season, year, description, starts_at, ends_at, active, created_by, updated_by) VALUES
    ('33100000-0000-0000-0000-000000000001', 'Spring Bloom 2026', 'spring-bloom-2026', 'SPRING', 2026, 'Spring collection', '2026-02-01', '2026-05-31', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000002', 'Summer Breeze 2026', 'summer-breeze-2026', 'SUMMER', 2026, 'Summer collection', '2026-04-01', '2026-08-31', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000003', 'Monsoon Muse 2026', 'monsoon-muse-2026', 'MONSOON', 2026, 'Monsoon edit', '2026-06-01', '2026-09-30', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000004', 'Festive Glow 2026', 'festive-glow-2026', 'FESTIVE', 2026, 'Festive wear', '2026-09-01', '2026-12-31', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000005', 'Winter Royale 2025', 'winter-royale-2025', 'WINTER', 2025, 'Winter collection', '2025-11-01', '2026-02-28', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000006', 'Bridal Couture 2026', 'bridal-couture-2026', 'BRIDAL', 2026, 'Bridal line', '2026-01-01', '2026-12-31', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000007', 'Heritage Weaves', 'heritage-weaves', 'HERITAGE', 2026, 'Heritage edit', '2026-01-01', '2026-06-30', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000008', 'Contemporary Edit', 'contemporary-edit', 'CONTEMPORARY', 2026, 'Modern styles', '2026-03-01', '2026-08-31', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000009', 'Pastel Dreams', 'pastel-dreams', 'SPRING', 2026, 'Pastel palette', '2026-02-15', '2026-04-30', TRUE, 'seed', 'seed'),
    ('33100000-0000-0000-0000-000000000010', 'Classic Reds', 'classic-reds', 'FESTIVE', 2026, 'Red festive tones', '2026-10-01', '2026-11-30', TRUE, 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- V21 may insert girls taxonomy before dev seed; drop migration rows so stable seed IDs apply.
DELETE FROM categories
WHERE deleted_at IS NULL
  AND created_by = 'migration'
  AND path IN ('/girls/girls-kurtas', '/girls/girls-lehengas', '/women/blouses');

DELETE FROM categories
WHERE deleted_at IS NULL
  AND created_by = 'migration'
  AND path IN ('/girls');

INSERT INTO categories (id, name, slug, description, parent_id, path, depth, display_order, active, image_url, created_by, updated_by) VALUES
    ('40100000-0000-0000-0000-000000000001', 'Women', 'women', 'Women''s couture', NULL, '/women', 0, 1, TRUE, 'https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000011', 'Girls', 'girls', 'Girls ethnic wear', NULL, '/girls', 0, 2, TRUE, 'https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000004', 'Sarees', 'sarees', 'Designer sarees', '40100000-0000-0000-0000-000000000001', '/women/sarees', 1, 1, TRUE, 'https://images.unsplash.com/photo-1610030469983-98e550b19538?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000005', 'Lehengas', 'lehengas', 'Bridal lehengas', '40100000-0000-0000-0000-000000000001', '/women/lehengas', 1, 2, TRUE, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000006', 'Kurtas', 'kurtas', 'Women kurtas', '40100000-0000-0000-0000-000000000001', '/women/kurtas', 1, 3, TRUE, 'https://images.unsplash.com/photo-1617627143750-d86bc21e3273?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000012', 'Blouses', 'blouses', 'Designer blouses', '40100000-0000-0000-0000-000000000001', '/women/blouses', 1, 4, TRUE, 'https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000013', 'Girls Kurtas', 'girls-kurtas', 'Girls kurtas and frocks', '40100000-0000-0000-0000-000000000011', '/girls/girls-kurtas', 1, 1, TRUE, 'https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=1200&q=80', 'seed', 'seed'),
    ('40100000-0000-0000-0000-000000000014', 'Girls Lehengas', 'girls-lehengas', 'Girls lehenga sets', '40100000-0000-0000-0000-000000000011', '/girls/girls-lehengas', 1, 2, TRUE, 'https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=1200&q=80', 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Products (10) + links
-- =============================================================================

INSERT INTO products (id, sku, name, description, price, compare_at_price, currency, status, category_id, fabric_id, print_id, offer_id, created_by, updated_by) VALUES
    ('50100000-0000-0000-0000-000000000001', 'GC-SAR-001', 'Royal Banarasi Saree', 'Handwoven Banarasi saree with zari.', 28999.00, 32999.00, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000004', '20100000-0000-0000-0000-000000000001', '30100000-0000-0000-0000-000000000001', '32100000-0000-0000-0000-000000000001', 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000002', 'GC-SAR-002', 'Kanjivaram Temple Saree', 'Temple border Kanjivaram.', 35999.00, NULL, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000004', '20100000-0000-0000-0000-000000000002', '30100000-0000-0000-0000-000000000005', NULL, 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000003', 'GC-LEH-001', 'Bridal Lehenga Set', 'Embroidered bridal lehenga.', 89999.00, 99999.00, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000005', '20100000-0000-0000-0000-000000000009', '30100000-0000-0000-0000-000000000009', '32100000-0000-0000-0000-000000000003', 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000004', 'GC-KUR-001', 'Chanderi Kurta Set', 'Light chanderi kurta with dupatta.', 12999.00, 14999.00, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000006', '20100000-0000-0000-0000-000000000003', '30100000-0000-0000-0000-000000000007', '32100000-0000-0000-0000-000000000005', 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000005', 'GC-SHW-001', 'Ivory Sherwani', 'Embroidered sherwani for grooms.', 45999.00, NULL, 'INR', 'ARCHIVED', '40100000-0000-0000-0000-000000000006', '20100000-0000-0000-0000-000000000010', '30100000-0000-0000-0000-000000000009', NULL, 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000006', 'GC-KID-001', 'Kids Festive Kurta', 'Kids ethnic kurta set.', 4999.00, 5999.00, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000013', '20100000-0000-0000-0000-000000000006', '30100000-0000-0000-0000-000000000006', '32100000-0000-0000-0000-000000000007', 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000007', 'GC-SAR-003', 'Georgette Party Saree', 'Lightweight party saree.', 15999.00, 17999.00, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000004', '20100000-0000-0000-0000-000000000004', '30100000-0000-0000-0000-000000000002', '32100000-0000-0000-0000-000000000009', 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000008', 'GC-LEH-002', 'Pastel Reception Lehenga', 'Pastel reception lehenga.', 64999.00, 69999.00, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000005', '20100000-0000-0000-0000-000000000005', '30100000-0000-0000-0000-000000000004', NULL, 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000009', 'GC-SAR-004', 'Tussar Handloom Saree', 'Matte tussar handloom.', 18999.00, NULL, 'INR', 'ACTIVE', '40100000-0000-0000-0000-000000000004', '20100000-0000-0000-0000-000000000007', '30100000-0000-0000-0000-000000000003', NULL, 'seed', 'seed'),
    ('50100000-0000-0000-0000-000000000010', 'GC-DRAFT-001', 'Sample Draft Piece', 'Draft product for admin testing.', 9999.00, NULL, 'INR', 'DRAFT', '40100000-0000-0000-0000-000000000006', '20100000-0000-0000-0000-000000000008', '30100000-0000-0000-0000-000000000010', NULL, 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, url, alt_text, display_order, created_by, updated_by) VALUES
    ('60100000-0000-0000-0000-000000000001', '50100000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1610030469983-98e550b19538?w=800', 'Royal Banarasi Saree', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000002', '50100000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1583391733981-464be288e924?w=800', 'Kanjivaram Temple Saree', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000003', '50100000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1595777457583-95e059a581f5?w=800', 'Bridal Lehenga Set', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000004', '50100000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1617627143750-d86bc21e3273?w=800&q=80', 'Chanderi Kurta Set', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000005', '50100000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1620799140408-8747d1d90e59?w=800', 'Ivory Sherwani', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000006', '50100000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800', 'Kids Festive Kurta', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000007', '50100000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1609639561548-ef9b8a55a146?w=800', 'Georgette Party Saree', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000008', '50100000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1594552074928-59f4a808a282?w=800', 'Pastel Reception Lehenga', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000009', '50100000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1617627150811-6ce36aa9e8c8?w=800', 'Tussar Handloom Saree', 0, 'seed', 'seed'),
    ('60100000-0000-0000-0000-000000000010', '50100000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1610030469983-98e550b19538?w=800', 'Sample Draft Piece', 0, 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id, created_at) VALUES
    ('50100000-0000-0000-0000-000000000001', '40100000-0000-0000-0000-000000000004', NOW()),
    ('50100000-0000-0000-0000-000000000002', '40100000-0000-0000-0000-000000000004', NOW()),
    ('50100000-0000-0000-0000-000000000003', '40100000-0000-0000-0000-000000000005', NOW()),
    ('50100000-0000-0000-0000-000000000004', '40100000-0000-0000-0000-000000000006', NOW()),
    ('50100000-0000-0000-0000-000000000005', '40100000-0000-0000-0000-000000000006', NOW()),
    ('50100000-0000-0000-0000-000000000006', '40100000-0000-0000-0000-000000000013', NOW()),
    ('50100000-0000-0000-0000-000000000007', '40100000-0000-0000-0000-000000000004', NOW()),
    ('50100000-0000-0000-0000-000000000008', '40100000-0000-0000-0000-000000000005', NOW()),
    ('50100000-0000-0000-0000-000000000009', '40100000-0000-0000-0000-000000000004', NOW()),
    ('50100000-0000-0000-0000-000000000010', '40100000-0000-0000-0000-000000000006', NOW())
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_tags (product_id, tag_id, created_at) VALUES
    ('50100000-0000-0000-0000-000000000001', '31100000-0000-0000-0000-000000000005', NOW()),
    ('50100000-0000-0000-0000-000000000002', '31100000-0000-0000-0000-000000000003', NOW()),
    ('50100000-0000-0000-0000-000000000003', '31100000-0000-0000-0000-000000000001', NOW()),
    ('50100000-0000-0000-0000-000000000004', '31100000-0000-0000-0000-000000000006', NOW()),
    ('50100000-0000-0000-0000-000000000005', '31100000-0000-0000-0000-000000000001', NOW()),
    ('50100000-0000-0000-0000-000000000006', '31100000-0000-0000-0000-000000000002', NOW()),
    ('50100000-0000-0000-0000-000000000007', '31100000-0000-0000-0000-000000000007', NOW()),
    ('50100000-0000-0000-0000-000000000008', '31100000-0000-0000-0000-000000000008', NOW()),
    ('50100000-0000-0000-0000-000000000009', '31100000-0000-0000-0000-000000000004', NOW()),
    ('50100000-0000-0000-0000-000000000010', '31100000-0000-0000-0000-000000000009', NOW())
ON CONFLICT (product_id, tag_id) DO NOTHING;

INSERT INTO product_seasonal_collections (product_id, seasonal_collection_id, created_at) VALUES
    ('50100000-0000-0000-0000-000000000001', '33100000-0000-0000-0000-000000000004', NOW()),
    ('50100000-0000-0000-0000-000000000002', '33100000-0000-0000-0000-000000000007', NOW()),
    ('50100000-0000-0000-0000-000000000003', '33100000-0000-0000-0000-000000000006', NOW()),
    ('50100000-0000-0000-0000-000000000004', '33100000-0000-0000-0000-000000000001', NOW()),
    ('50100000-0000-0000-0000-000000000005', '33100000-0000-0000-0000-000000000006', NOW()),
    ('50100000-0000-0000-0000-000000000006', '33100000-0000-0000-0000-000000000002', NOW()),
    ('50100000-0000-0000-0000-000000000007', '33100000-0000-0000-0000-000000000010', NOW()),
    ('50100000-0000-0000-0000-000000000008', '33100000-0000-0000-0000-000000000009', NOW()),
    ('50100000-0000-0000-0000-000000000009', '33100000-0000-0000-0000-000000000003', NOW()),
    ('50100000-0000-0000-0000-000000000010', '33100000-0000-0000-0000-000000000008', NOW())
ON CONFLICT (product_id, seasonal_collection_id) DO NOTHING;

-- Non-admin users and CRM demo accounts are not seeded.
-- Only the system admin from V8 / seed_roles_admin remains.
