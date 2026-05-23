CREATE TABLE notification_outbox (
    id              UUID PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSON NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    processed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    CONSTRAINT chk_outbox_status CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED'))
);

CREATE INDEX idx_notification_outbox_status ON notification_outbox(status);
