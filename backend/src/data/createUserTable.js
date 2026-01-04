import pool from "../config/db.js";
export const createUserTable = async () => {
  const createQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id serial primary key,
            name varchar(100) not null,
            email varchar(100) unique not null,
            password varchar(255),
            created_at timestamp default now()
        )`;

  const alterQuery = `ALTER TABLE users ADD COLUMN IF NOT EXISTS password varchar(255)`;

  const alterResetTokenQuery = `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token varchar(255),
        ADD COLUMN IF NOT EXISTS reset_token_expires timestamp
    `;

  try {
    await pool.query(createQuery);
    // ensure password column exists for older schemas
    await pool.query(alterQuery);
    // add reset token columns
    await pool.query(alterResetTokenQuery);
    console.log("Users table created/updated successfully");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

export default createUserTable;
