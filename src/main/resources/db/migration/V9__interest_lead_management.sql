-- Extend customer_interest for CRM lead fields and workflow statuses
ALTER TABLE customer_interest
    ADD COLUMN customer_name VARCHAR(200),
    ADD COLUMN whatsapp VARCHAR(30),
    ADD COLUMN size VARCHAR(50),
    ADD COLUMN color VARCHAR(100);

UPDATE customer_interest
SET customer_name = COALESCE(NULLIF(split_part(email, '@', 1), ''), 'Guest')
WHERE customer_name IS NULL;

ALTER TABLE customer_interest
    ALTER COLUMN customer_name SET NOT NULL;

ALTER TABLE customer_interest
    ALTER COLUMN email DROP NOT NULL;

UPDATE customer_interest SET status = 'INTERESTED' WHERE status = 'QUALIFIED';
UPDATE customer_interest SET status = 'CONFIRMED' WHERE status = 'CONVERTED';
UPDATE customer_interest SET status = 'LOST' WHERE status = 'CLOSED';

ALTER TABLE customer_interest DROP CONSTRAINT chk_customer_interest_status;

ALTER TABLE customer_interest
    ADD CONSTRAINT chk_customer_interest_status CHECK (
        status IN (
            'NEW',
            'CONTACTED',
            'INTERESTED',
            'TRIAL_BOOKED',
            'CONFIRMED',
            'DELIVERED',
            'LOST'
        )
    );

CREATE TABLE customer_interest_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interest_id UUID NOT NULL REFERENCES customer_interest(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    details TEXT,
    performed_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_interest_audit_interest_id ON customer_interest_audit_log (interest_id);
CREATE INDEX idx_customer_interest_created_at ON customer_interest (created_at);
CREATE INDEX idx_customer_interest_status ON customer_interest (status);
CREATE INDEX idx_customer_interest_phone ON customer_interest (phone);
