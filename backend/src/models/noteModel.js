import pool from "../config/db.js";

export const createNoteService = async (
  userId,
  title,
  body,
  noteDate,
  color = "default"
) => {
  const result = await pool.query(
    "INSERT INTO notes (user_id, title, body, note_date, color) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [userId, title, body, noteDate, color]
  );
  return result.rows[0];
};

export const getNotesByDayService = async (userId, date) => {
  const result = await pool.query(
    "SELECT * FROM notes WHERE user_id=$1 AND note_date=$2 AND deleted_at IS NULL AND is_archived=false ORDER BY is_pinned DESC, created_at DESC",
    [userId, date]
  );
  return result.rows;
};

export const getNotesByMonthService = async (userId, year, month) => {
  const result = await pool.query(
    "SELECT * FROM notes WHERE user_id=$1 AND EXTRACT(YEAR FROM note_date)=$2 AND EXTRACT(MONTH FROM note_date)=$3 ORDER BY note_date DESC, created_at DESC",
    [userId, year, month]
  );
  return result.rows;
};

export const getNotesByYearService = async (userId, year) => {
  const result = await pool.query(
    "SELECT * FROM notes WHERE user_id=$1 AND EXTRACT(YEAR FROM note_date)=$2 ORDER BY note_date DESC, created_at DESC",
    [userId, year]
  );
  return result.rows;
};

export const getNotesService = async (userId, searchTerm) => {
  const params = [userId];
  let query =
    "SELECT * FROM notes WHERE user_id=$1 AND deleted_at IS NULL AND is_archived=false ORDER BY is_pinned DESC, note_date DESC NULLS LAST, created_at DESC";

  if (searchTerm && searchTerm.trim() !== "") {
    params.push(`%${searchTerm.trim()}%`);
    query =
      "SELECT * FROM notes WHERE user_id=$1 AND deleted_at IS NULL AND is_archived=false AND (title ILIKE $2 OR body ILIKE $2 OR COALESCE(note_date::text,'') ILIKE $2) ORDER BY is_pinned DESC, note_date DESC NULLS LAST, created_at DESC";
  }

  const result = await pool.query(query, params);
  const notes = result.rows;

  // Fetch labels for each note
  for (let note of notes) {
    const labelsResult = await pool.query(
      `SELECT l.* FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id
       WHERE nl.note_id = $1
       ORDER BY l.name ASC`,
      [note.id]
    );
    note.labels = labelsResult.rows;
  }

  return notes;
};

export const getArchivedNotesService = async (userId, searchTerm) => {
  const params = [userId];
  let query =
    "SELECT * FROM notes WHERE user_id=$1 AND is_archived=true AND deleted_at IS NULL ORDER BY created_at DESC";

  if (searchTerm && searchTerm.trim() !== "") {
    params.push(`%${searchTerm.trim()}%`);
    query =
      "SELECT * FROM notes WHERE user_id=$1 AND is_archived=true AND deleted_at IS NULL AND (title ILIKE $2 OR body ILIKE $2) ORDER BY created_at DESC";
  }

  const result = await pool.query(query, params);
  const notes = result.rows;

  // Fetch labels for each note
  for (let note of notes) {
    const labelsResult = await pool.query(
      `SELECT l.* FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id
       WHERE nl.note_id = $1
       ORDER BY l.name ASC`,
      [note.id]
    );
    note.labels = labelsResult.rows;
  }

  return notes;
};

export const getTrashedNotesService = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM notes WHERE user_id=$1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC",
    [userId]
  );
  const notes = result.rows;

  // Fetch labels for each note
  for (let note of notes) {
    const labelsResult = await pool.query(
      `SELECT l.* FROM labels l
       JOIN note_labels nl ON l.id = nl.label_id
       WHERE nl.note_id = $1
       ORDER BY l.name ASC`,
      [note.id]
    );
    note.labels = labelsResult.rows;
  }

  return notes;
};

export const togglePinService = async (noteId, userId) => {
  const result = await pool.query(
    "UPDATE notes SET is_pinned = NOT is_pinned WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING *",
    [noteId, userId]
  );
  return result.rows[0];
};

export const toggleArchiveService = async (noteId, userId) => {
  const result = await pool.query(
    "UPDATE notes SET is_archived = NOT is_archived WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING *",
    [noteId, userId]
  );
  return result.rows[0];
};

export const softDeleteNoteService = async (noteId, userId) => {
  const result = await pool.query(
    "UPDATE notes SET deleted_at=NOW(), is_pinned=false WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING *",
    [noteId, userId]
  );
  return result.rows[0];
};

export const restoreNoteService = async (noteId, userId) => {
  const result = await pool.query(
    "UPDATE notes SET deleted_at=NULL WHERE id=$1 AND user_id=$2 AND deleted_at IS NOT NULL RETURNING *",
    [noteId, userId]
  );
  return result.rows[0];
};

export const permanentDeleteNoteService = async (noteId, userId) => {
  const result = await pool.query(
    "DELETE FROM notes WHERE id=$1 AND user_id=$2 AND deleted_at IS NOT NULL RETURNING *",
    [noteId, userId]
  );
  return result.rows[0];
};

export const updateNoteService = async (
  noteId,
  userId,
  title,
  body,
  noteDate,
  color
) => {
  const result = await pool.query(
    "UPDATE notes SET title=$1, body=$2, note_date=$3, color=$4 WHERE id=$5 AND user_id=$6 RETURNING *",
    [title, body, noteDate, color, noteId, userId]
  );
  return result.rows[0];
};

export const deleteNoteService = async (noteId, userId) => {
  const result = await pool.query(
    "DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING *",
    [noteId, userId]
  );
  return result.rows[0];
};

export default {
  createNoteService,
  getNotesByDayService,
  getNotesByMonthService,
  getNotesByYearService,
  updateNoteService,
  deleteNoteService,
  getNotesService,
  getArchivedNotesService,
  getTrashedNotesService,
  togglePinService,
  toggleArchiveService,
  softDeleteNoteService,
  restoreNoteService,
  permanentDeleteNoteService,
};
