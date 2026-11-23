export const up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema()
                 AND table_name = 'users' AND column_name = 'hashed_password')
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema()
                         AND table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users RENAME COLUMN hashed_password TO password_hash;
      END IF;
    END $$;
    ALTER TABLE users ALTER COLUMN email TYPE varchar(254);
    CREATE UNIQUE INDEX users_email_case_insensitive ON users (lower(email));

    CREATE FUNCTION invalidate_account_credentials() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE email_changed boolean := lower(OLD.email) <> lower(NEW.email);
    BEGIN
      IF email_changed THEN
        NEW.email_verified := FALSE;
        NEW.email_verification_hash := NULL;
        NEW.email_verification_expires_at := NULL;
      END IF;
      IF email_changed OR OLD.password_hash IS DISTINCT FROM NEW.password_hash
                       OR (OLD.is_active AND NOT NEW.is_active) THEN
        UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.id AND revoked_at IS NULL;
      END IF;
      RETURN NEW;
    END $$;
    CREATE TRIGGER users_invalidate_credentials BEFORE UPDATE OF email, password_hash, is_active ON users
    FOR EACH ROW EXECUTE FUNCTION invalidate_account_credentials();

    UPDATE proposals p SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
    FROM projects pr WHERE pr.id = p.project_id AND pr.status = 'cancelled' AND p.status = 'pending';
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER users_invalidate_credentials ON users;
    DROP FUNCTION invalidate_account_credentials();
    DROP INDEX users_email_case_insensitive;
  `);
};
