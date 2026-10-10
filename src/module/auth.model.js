import { pool } from "../config/db.js";

export const createUser = async ({
  username,
  email,
  hashed_password,
  role,
}) => {
  const query = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, role, created_at;
    `;
  const values = [username, email, hashed_password, role || "user"];

  const result = await pool.query(query, values);
  return result.rows[0];
};

//find user by email
export const findUserByEmail = async (email) => {
  const result = await pool.query("select * from users where email = $1", [
    email,
  ]);
  return result[0];
};
