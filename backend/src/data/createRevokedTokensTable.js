import pool from "../config/db.js";

export const createRevokedTokensTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      token text PRIMARY KEY,
      expires_at timestamp
    )`;

  try {
    await pool.query(query);
    console.log("Revoked tokens table created successfully");
  } catch (err) {
    console.error("Error creating revoked_tokens table:", err);
  }
};

export default createRevokedTokensTable;
