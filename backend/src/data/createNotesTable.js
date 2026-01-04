import pool from "../config/db.js";

export const createNotesTable = async () => {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS notes (
      id serial primary key,
      user_id integer references users(id) on delete cascade,
      title varchar(255),
      body text,
      note_date date,
      created_at timestamp default now()
    )`;

  try {
    await pool.query(createQuery);
    // remove legacy `content` column if it exists to avoid NOT NULL issues
    await pool.query("ALTER TABLE notes DROP COLUMN IF EXISTS content");
    // ensure new columns exist for existing tables
    await pool.query(
      "ALTER TABLE notes ADD COLUMN IF NOT EXISTS title varchar(255)"
    );
    await pool.query("ALTER TABLE notes ADD COLUMN IF NOT EXISTS body text");
    // add new columns for pin, archive, and soft delete
    await pool.query(
      "ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false"
    );
    await pool.query(
      "ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false"
    );
    await pool.query(
      "ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted_at timestamp"
    );
    await pool.query(
      "ALTER TABLE notes ADD COLUMN IF NOT EXISTS color varchar(20) DEFAULT 'default'"
    );
    console.log("Notes table created/updated successfully");
  } catch (err) {
    console.error("Error creating/updating notes table:", err);
  }
};

export default createNotesTable;
