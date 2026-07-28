-- Adds product size/color options required by Hibernate schema validation (V22).
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_sizes VARCHAR(200);
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_colors TEXT;
