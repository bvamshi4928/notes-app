import pool from "../config/db.js";

export const createAttachment = async (
  noteId,
  filename,
  originalName,
  mimeType,
  size,
  path
) => {
  const result = await pool.query(
    `INSERT INTO attachments (note_id, filename, original_name, mime_type, size, path) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [noteId, filename, originalName, mimeType, size, path]
  );
  return result.rows[0];
};

export const getAttachmentById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, n.user_id FROM attachments a JOIN notes n ON a.note_id = n.id WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getAttachmentsByNote = async (noteId) => {
  const result = await pool.query(
    `SELECT a.* FROM attachments a WHERE a.note_id = $1 ORDER BY created_at DESC`,
    [noteId]
  );
  return result.rows;
};

export const deleteAttachmentById = async (id) => {
  const result = await pool.query(
    `DELETE FROM attachments WHERE id=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export default {
  createAttachment,
  getAttachmentById,
  deleteAttachmentById,
};
