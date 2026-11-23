import { pool } from "../config/db.js";

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, username, email, role, status, is_active, created_at, updated_at
     FROM users
     ORDER BY created_at DESC, id DESC`,
  );
  return result;
};

export const findUserById = async (id) => {
  const query = `
    SELECT
      id,
      username,
      email,
      role,
      is_active,
      email_verified
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

export const updateUserById = async (id, userData) => {
  const { username, email, role, is_active } = userData;
  const result = await pool.query(
    `UPDATE users
     SET username = $1, email = $2, role = $3, is_active = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, username, email, role, is_active, status, updated_at`,
    [username, email, role, is_active, id],
  );
  return result.rows[0];
};
export const updateUserStatusById = async (id, status) => {
  const result = await pool.query(
    "update users set status = $1 where id = $2",
    [status, id],
  );
  return result;
};

export const deactivateUserById = async (id) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = FALSE, status = 'inactive', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_active = TRUE
     RETURNING id, username, email, role, status, is_active, created_at, updated_at`,
    [id],
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("select * from users where lower(email) = lower($1)", [
    email,
  ]);
  return result.rows[0];
};

export const updateOwnProfile = async (id, username, email) => {
  const result = await pool.query(
    `UPDATE users
     SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, username, email, role, email_verified, is_active, updated_at`,
    [username, email, id],
  );
  return result.rows[0];
};

export const updatePassword = async (id, passwordHash, previousHash) => {
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND password_hash = $3
     RETURNING id, username, email, role`,
    [passwordHash, id, previousHash],
  );
  return result.rows[0];
};

export const setEmailVerified = async (tokenHash) => {
  const result = await pool.query(
    `UPDATE users
     SET email_verified = TRUE,
         email_verification_hash = NULL,
         email_verification_expires_at = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE is_active AND NOT email_verified AND email_verification_hash = $1
       AND email_verification_expires_at > CURRENT_TIMESTAMP
     RETURNING id, username, email, role`,
    [tokenHash],
  );
  return result.rows[0];
};

export const resendVerificationEmail = async (email, tokenHash, deliver) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT id, email, username FROM users
       WHERE lower(email) = lower($1) AND is_active AND NOT email_verified FOR UPDATE`,
      [email],
    );
    if (rows.length) {
      await client.query(
        `UPDATE users SET email_verification_hash = $1,
         email_verification_expires_at = CURRENT_TIMESTAMP + interval '24 hours',
         updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [tokenHash, rows[0].id],
      );
      try {
        await deliver(rows[0]);
      } catch (cause) {
        throw Object.assign(new Error("Email delivery failed", { cause }), { verificationDeliveryFailed: true });
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findPasswordHashById = async (id) => {
  const result = await pool.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0];
};
