-- MVP performance indexes (cheap — no RDS tier change)
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_customer_id ON wishlist_items (customer_id) WHERE deleted_at IS NULL;
