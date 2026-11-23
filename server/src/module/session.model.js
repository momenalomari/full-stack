import { pool } from "../config/db.js";

export const createRefreshSession = async ({
  id,
  user_id,
  token_hash,
  expires_at,
  passwordHash,
}) => {
  const result = await pool.query(
    `INSERT INTO refresh_sessions (id, user_id, token_hash, expires_at)
     SELECT $1, id, $3, $4 FROM users
     WHERE id = $2 AND is_active AND email_verified AND password_hash = $5
     FOR SHARE`,
    [id, user_id, token_hash, expires_at, passwordHash],
  );
  return result.rowCount === 1;
};

export const rotateRefreshSession = async ({
  id,
  previousTokenHash,
  nextTokenHash,
  expiresAt,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT token_hash, expires_at, revoked_at
       FROM refresh_sessions
       WHERE id = $1
       FOR UPDATE`,
      [id],
    );
    const session = result.rows[0];

    if (
      !session ||
      session.revoked_at ||
      new Date(session.expires_at) <= new Date()
    ) {
      await client.query("COMMIT");
      return false;
    }

    if (session.token_hash !== previousTokenHash) {
      await client.query(
        "UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id],
      );
      await client.query("COMMIT");
      return false;
    }

    await client.query(
      `UPDATE refresh_sessions
       SET token_hash = $1, expires_at = $2
       WHERE id = $3`,
      [nextTokenHash, expiresAt, id],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw error;
  } finally {
    client.release();
  }
};

export const revokeRefreshSession = async (id, tokenHash) => {
  const result = await pool.query(
    `UPDATE refresh_sessions
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND token_hash = $2 AND revoked_at IS NULL`,
    [id, tokenHash],
  );
  return result.rowCount > 0;
};
