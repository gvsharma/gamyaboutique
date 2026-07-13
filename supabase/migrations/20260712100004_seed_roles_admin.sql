-- Gamya Couture: essential seed data (roles, admin user)
-- Ported from Flyway V2 + V8

INSERT INTO roles (id, code, name, description, created_by, updated_by) VALUES
    ('10000000-0000-0000-0000-000000000001', 'ADMIN', 'Administrator', 'Full system access', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000002', 'STAFF', 'Staff', 'Boutique staff', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000003', 'CUSTOMER', 'Customer', 'Registered customer', 'system', 'system')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, enabled, created_by, updated_by)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@gamyacouture.com',
    '$2a$10$GTl3TdS2Ewd2dRIEmdRiuOJhj87QoD5G.g039ienBf2WHXT9QhaOK',
    'System',
    'Admin',
    TRUE,
    'system',
    'system'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, role_id) DO NOTHING;
