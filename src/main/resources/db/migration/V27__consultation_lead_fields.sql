-- Phase C: consultation / relationship fields on CRM leads

ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS occasion VARCHAR(120),
    ADD COLUMN IF NOT EXISTS budget_band VARCHAR(50),
    ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
    ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS stylist_notes TEXT;
