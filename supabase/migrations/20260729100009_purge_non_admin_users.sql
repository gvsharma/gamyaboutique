-- Remove every user except the seeded system admin (admin@gamyacouture.com).

DO $$
DECLARE
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
    admin_role_id UUID := '10000000-0000-0000-0000-000000000001';
BEGIN
    DELETE FROM user_sessions
    WHERE user_id <> admin_user_id;

    DELETE FROM password_reset_tokens
    WHERE user_id <> admin_user_id;

    DELETE FROM notifications
    WHERE user_id IS NOT NULL
      AND user_id <> admin_user_id;

    DELETE FROM user_roles
    WHERE user_id <> admin_user_id;

    DELETE FROM users
    WHERE id <> admin_user_id;

    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;
