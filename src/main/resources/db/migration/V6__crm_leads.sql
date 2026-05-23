CREATE TABLE crm_leads (
    id              UUID PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    source          VARCHAR(50) NOT NULL DEFAULT 'WEBSITE',
    status          VARCHAR(30) NOT NULL DEFAULT 'NEW',
    notes           TEXT,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    CONSTRAINT chk_lead_status CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'WON')),
    CONSTRAINT chk_lead_source CHECK (source IN ('WEBSITE', 'PRODUCT_INTEREST', 'REFERRAL', 'WALK_IN', 'OTHER'))
);

CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_email ON crm_leads(email);
CREATE INDEX idx_crm_leads_created ON crm_leads(created_at);
