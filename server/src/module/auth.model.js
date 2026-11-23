import { pool } from "../config/db.js";

export const createUser = async ({
  username,
  email,
  hashed_password,
  role,
  email_verification_hash,
  email_verification_expires_at,
}) => {
  const query = `
    INSERT INTO users (
      username,
      email,
      password_hash,
      role,
      email_verified,
      email_verification_hash,
      email_verification_expires_at
    )
    VALUES ($1, $2, $3, $4, FALSE, $5, $6)
    RETURNING id, username, email, role, email_verified, created_at;
  `;

  const values = [
    username,
    email,
    hashed_password,
    role || "user",
    email_verification_hash,
    email_verification_expires_at,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};
