import pool from "../config/db.js";

export const createLabelService = async (userId, name) => {
  const result = await pool.query(
    "INSERT INTO labels (user_id, name) VALUES ($1, $2) ON CONFLICT (user_id, name) DO UPDATE SET name=EXCLUDED.name RETURNING *",
    [userId, name]
  );
  return result.rows[0];
};

export const getUserLabelsService = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM labels WHERE user_id=$1 ORDER BY name ASC",
    [userId]
  );
  return result.rows;
};

export const updateLabelService = async (labelId, userId, name) => {
  const result = await pool.query(
    "UPDATE labels SET name=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
    [name, labelId, userId]
  );
  return result.rows[0];
};

export const deleteLabelService = async (labelId, userId) => {
  const result = await pool.query(
    "DELETE FROM labels WHERE id=$1 AND user_id=$2 RETURNING *",
    [labelId, userId]
  );
  return result.rows[0];
};

export const addLabelToNoteService = async (noteId, labelId) => {
  const result = await pool.query(
    "INSERT INTO note_labels (note_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
    [noteId, labelId]
  );
  return result.rows[0];
};

export const removeLabelFromNoteService = async (noteId, labelId) => {
  const result = await pool.query(
    "DELETE FROM note_labels WHERE note_id=$1 AND label_id=$2 RETURNING *",
    [noteId, labelId]
  );
  return result.rows[0];
};

export const getNoteLabelsByNoteIdService = async (noteId) => {
  const result = await pool.query(
    `SELECT l.* FROM labels l
     JOIN note_labels nl ON l.id = nl.label_id
     WHERE nl.note_id = $1
     ORDER BY l.name ASC`,
    [noteId]
  );
  return result.rows;
};

export const getNotesByLabelService = async (userId, labelId) => {
  const result = await pool.query(
    `SELECT n.* FROM notes n
     JOIN note_labels nl ON n.id = nl.note_id
     WHERE n.user_id = $1 AND nl.label_id = $2 AND n.deleted_at IS NULL
     ORDER BY n.is_pinned DESC, n.created_at DESC`,
    [userId, labelId]
  );
  return result.rows;
};

export default {
  createLabelService,
  getUserLabelsService,
  updateLabelService,
  deleteLabelService,
  addLabelToNoteService,
  removeLabelFromNoteService,
  getNoteLabelsByNoteIdService,
  getNotesByLabelService,
};
