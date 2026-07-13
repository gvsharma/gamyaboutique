-- Gamya Couture: Row Level Security policies
-- Spring Boot connects via postgres role (bypasses RLS).
-- These policies protect direct PostgREST / Supabase client access.

-- Enable RLS on all business tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_seasonal_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interest_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_policies ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Public catalog read (anon + authenticated)
-- =============================================================================

CREATE POLICY "Public read active categories"
    ON categories FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL AND active = TRUE);

CREATE POLICY "Public read active fabrics"
    ON fabrics FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL AND active = TRUE);

CREATE POLICY "Public read active prints"
    ON prints FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL AND active = TRUE);

CREATE POLICY "Public read tags"
    ON tags FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "Public read active offers"
    ON offers FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL AND active = TRUE);

CREATE POLICY "Public read active seasonal collections"
    ON seasonal_collections FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL AND active = TRUE);

CREATE POLICY "Public read active products"
    ON products FOR SELECT TO anon, authenticated
    USING (deleted_at IS NULL AND status = 'ACTIVE');

CREATE POLICY "Public read product images"
    ON product_images FOR SELECT TO anon, authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_images.product_id
              AND p.deleted_at IS NULL
              AND p.status = 'ACTIVE'
        )
    );

CREATE POLICY "Public read product tags"
    ON product_tags FOR SELECT TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read product categories"
    ON product_categories FOR SELECT TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read product seasonal collections"
    ON product_seasonal_collections FOR SELECT TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read site policies"
    ON site_policies FOR SELECT TO anon, authenticated
    USING (TRUE);

-- =============================================================================
-- Public write: interest submissions & guest cart (boutique lead capture)
-- =============================================================================

CREATE POLICY "Anyone can submit product interest"
    ON customer_interest FOR INSERT TO anon, authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Anyone can create guest carts"
    ON carts FOR INSERT TO anon, authenticated
    WITH CHECK (guest_token IS NOT NULL AND customer_id IS NULL);

CREATE POLICY "Anyone can read guest carts by token"
    ON carts FOR SELECT TO anon, authenticated
    USING (guest_token IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Anyone can update guest carts"
    ON carts FOR UPDATE TO anon, authenticated
    USING (guest_token IS NOT NULL AND deleted_at IS NULL)
    WITH CHECK (guest_token IS NOT NULL);

CREATE POLICY "Anyone can manage guest cart items"
    ON cart_items FOR ALL TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts c
            WHERE c.id = cart_items.cart_id
              AND c.guest_token IS NOT NULL
              AND c.deleted_at IS NULL
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts c
            WHERE c.id = cart_items.cart_id
              AND c.guest_token IS NOT NULL
              AND c.deleted_at IS NULL
        )
    );

-- =============================================================================
-- Deny direct API access to sensitive tables (backend-only via postgres role)
-- No policies = no access for anon/authenticated on these tables.
-- =============================================================================
-- users, roles, user_roles, user_sessions, password_reset_tokens,
-- otp_verifications, login_attempts, customers, addresses,
-- wishlist_items, recently_viewed_products, notifications,
-- notification_outbox, crm_leads, manual_orders, manual_order_items,
-- customer_interest_audit_log

-- Revoke default public grants for defense in depth
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
