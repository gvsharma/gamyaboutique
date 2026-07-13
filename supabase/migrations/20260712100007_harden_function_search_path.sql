-- Harden trigger functions with fixed search_path (Supabase advisor)

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.name,'')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description,'')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.sku,'')), 'A');
    RETURN NEW;
END;
$$;
