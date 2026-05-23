INSERT INTO users (id, email, password_hash, first_name, last_name, enabled, created_by, updated_by)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@gamyacouture.com',
    '$2a$10$GTl3TdS2Ewd2dRIEmdRiuOJhj87QoD5G.g039ienBf2WHXT9QhaOK', 'System', 'Admin', TRUE, 'system', 'system');
INSERT INTO user_roles (user_id, role_id) VALUES ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001');
