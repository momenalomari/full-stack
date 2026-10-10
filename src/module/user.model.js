import { pool } from "../config/db.js";


export const getAllUsers = async () => {

  const result = await pool.query(
    "select username, email, updated_at, created_at, id ,role ,is_active from users ",
  );
  return result;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    "select username, email, updated_at, created_at, id ,role ,is_active from users where id = $1",
    [id]
  );
  return result.rows[0];
};

export const updateUserById = async (id, userData) => {
  const { username, email, role, is_active } = userData;
  const result = await pool.query(
    "update users set username = $1, email = $2, role = $3, is_active = $4 where id = $5 returning *", 
    [username, email, role, is_active,  id]
  );
  return result;
};
export const updateUserStatusById = async (id, status) => {
  const result = await pool.query(
    "update users set status = $1 where id = $2",
    [status, id]
  );
  return result;
};

export const deleteUserById = async (id) => {
  const result = await pool.query("delete from users where id = $1", [id]);
  return result;
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("select * from users where email = $1", [
    email,
  ]);
  return result.rows[0];
};
