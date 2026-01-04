import pool from "../config/db.js";

export const createAttachmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attachments (
      id serial primary key,
      note_id integer references notes(id) on delete cascade,
      filename varchar(255) not null,
      original_name varchar(255),
      mime_type varchar(100),
      size bigint,
      path text not null,
      created_at timestamp default now()
    )`;

  try {
    await pool.query(query);
    console.log("Attachments table created successfully");
  } catch (err) {
    console.error("Error creating attachments table:", err);
  }
};

export default createAttachmentsTable;
