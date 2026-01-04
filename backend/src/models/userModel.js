import pool from "../config/db.js";

export const createUserService = async (name, email, password) => {
  const result = await pool.query(
    "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
    [name, email, password]
  );
  return result.rows[0];
};

export const getUserByEmailService = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  return result.rows[0];
};

export const getUserByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  return result.rows[0];
};

export const updateUserPasswordService = async (userId, hashedPassword) => {
  const result = await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2 RETURNING *",
    [hashedPassword, userId]
  );
  return result.rows[0];
};

export default { createUserService, getUserByEmailService };
