import pool from "../config/db.js";

export const createLabelsTable = async () => {
  const createLabelsQuery = `
    CREATE TABLE IF NOT EXISTS labels (
      id serial primary key,
      user_id integer references users(id) on delete cascade,
      name varchar(100) not null,
      created_at timestamp default now(),
      UNIQUE(user_id, name)
    )`;

  const createNoteLabelsQuery = `
    CREATE TABLE IF NOT EXISTS note_labels (
      note_id integer references notes(id) on delete cascade,
      label_id integer references labels(id) on delete cascade,
      created_at timestamp default now(),
      PRIMARY KEY (note_id, label_id)
    )`;

  try {
    await pool.query(createLabelsQuery);
    await pool.query(createNoteLabelsQuery);
    console.log("Labels tables created/updated successfully");
  } catch (err) {
    console.error("Error creating labels tables:", err);
  }
};

export default createLabelsTable;
