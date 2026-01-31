import {
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
} from "../models/noteModel.js";
import {
  createAttachment,
  getAttachmentById,
  deleteAttachmentById,
  getAttachmentsByNote,
} from "../models/attachmentModel.js";
import path from "path";
import pool from "../config/db.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const attachAttachments = async (notes) => {
  return Promise.all(
    notes.map(async (n) => ({
      ...n,
      attachments: await getAttachmentsByNote(n.id),
    })),
  );
};

export const createNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // accept title, body as fields; optional note_date, color
    const { title, body, note_date, color } = req.body; // note_date optional, format YYYY-MM-DD
    if (!title || !body)
      return handleResponse(res, 400, "Title and body required");

    const note = await createNoteService(
      userId,
      title,
      body,
      note_date || new Date(),
      color || "default",
    );

    // if an image was uploaded in the same request (field name 'image'), save locally
    let savedAttachment = null;
    if (req.file) {
      // Store path relative to backend/src/uploads
      const uploadsDir = path.join(process.cwd(), "backend", "src", "uploads");
      const relPath = path.relative(uploadsDir, req.file.path);
      savedAttachment = await createAttachment(
        note.id,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        relPath, // store path relative to uploads dir
      );
    }

    handleResponse(res, 201, "Note created", {
      note,
      attachment: savedAttachment,
    });
  } catch (err) {
    next(err);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    const notes = await getNotesService(userId, search);
    const withAttachments = await attachAttachments(notes);
    handleResponse(res, 200, "Notes retrieved", withAttachments);
  } catch (err) {
    next(err);
  }
};

export const getNotesByDay = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date } = req.params; // expect YYYY-MM-DD
    let notes = await getNotesByDayService(userId, date);
    // defensive: ensure only notes belonging to this user are returned
    notes = notes.filter((n) => n.user_id === userId);
    const withAttachments = await attachAttachments(notes);
    handleResponse(res, 200, "Notes retrieved", withAttachments);
  } catch (err) {
    next(err);
  }
};

export const getNotesByMonth = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.params; // year=YYYY month=MM
    let notes = await getNotesByMonthService(userId, year, month);
    notes = notes.filter((n) => n.user_id === userId);
    const withAttachments = await attachAttachments(notes);
    handleResponse(res, 200, "Notes retrieved", withAttachments);
  } catch (err) {
    next(err);
  }
};

export const getNotesByYear = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year } = req.params; // year=YYYY
    let notes = await getNotesByYearService(userId, year);
    notes = notes.filter((n) => n.user_id === userId);
    const withAttachments = await attachAttachments(notes);
    handleResponse(res, 200, "Notes retrieved", withAttachments);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, body, note_date, color } = req.body;
    if (!title || !body)
      return handleResponse(res, 400, "Title and body required");

    const updated = await updateNoteService(
      id,
      userId,
      title,
      body,
      note_date || null,
      color || "default",
    );
    if (!updated)
      return handleResponse(res, 404, "Note not found or not allowed");

    // if an image was uploaded during update, save locally
    let savedAttachment = null;
    if (req.file) {
      const uploadsDir = path.join(process.cwd(), "backend", "src", "uploads");
      const relPath = path.relative(uploadsDir, req.file.path);
      savedAttachment = await createAttachment(
        updated.id,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        relPath,
      );
    }

    handleResponse(res, 200, "Note updated", {
      updated,
      attachment: savedAttachment,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deleted = await softDeleteNoteService(id, userId);
    if (!deleted)
      return handleResponse(res, 404, "Note not found or not allowed");
    handleResponse(res, 200, "Note moved to trash", deleted);
  } catch (err) {
    next(err);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await togglePinService(id, userId);
    if (!updated)
      return handleResponse(res, 404, "Note not found or not allowed");
    handleResponse(res, 200, "Note pin status updated", updated);
  } catch (err) {
    next(err);
  }
};

export const toggleArchive = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await toggleArchiveService(id, userId);
    if (!updated)
      return handleResponse(res, 404, "Note not found or not allowed");
    handleResponse(res, 200, "Note archive status updated", updated);
  } catch (err) {
    next(err);
  }
};

export const getArchivedNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    const notes = await getArchivedNotesService(userId, search);
    const withAttachments = await attachAttachments(notes);
    handleResponse(res, 200, "Archived notes retrieved", withAttachments);
  } catch (err) {
    next(err);
  }
};

export const getTrashedNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notes = await getTrashedNotesService(userId);
    const withAttachments = await attachAttachments(notes);
    handleResponse(res, 200, "Trashed notes retrieved", withAttachments);
  } catch (err) {
    next(err);
  }
};

export const restoreNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const restored = await restoreNoteService(id, userId);
    if (!restored) return handleResponse(res, 404, "Note not found in trash");
    handleResponse(res, 200, "Note restored", restored);
  } catch (err) {
    next(err);
  }
};

export const permanentDeleteNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    // remove attachment files from local storage
    const attachments = await getAttachmentsByNote(id);
    for (const a of attachments) {
      try {
        const filePath = path.join(process.cwd(), a.path);
        await import("fs").then((fs) =>
          fs.promises.unlink(filePath).catch(() => {}),
        );
      } catch (e) {
        console.error("Error deleting local file", a.path, e);
      }
    }

    const deleted = await permanentDeleteNoteService(id, userId);
    if (!deleted) return handleResponse(res, 404, "Note not found in trash");
    handleResponse(res, 200, "Note permanently deleted", deleted);
  } catch (err) {
    next(err);
  }
};

export const uploadAttachments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: noteId } = req.params;
    // verify note ownership
    const noteCheck = await pool.query(
      "SELECT user_id FROM notes WHERE id=$1",
      [noteId],
    );
    if (!noteCheck.rows[0]) return handleResponse(res, 404, "Note not found");
    if (noteCheck.rows[0].user_id !== userId)
      return handleResponse(res, 403, "Not authorized to upload to this note");
    // check files
    if (!req.files || req.files.length === 0)
      return handleResponse(res, 400, "No files uploaded");

    const saved = [];
    for (const file of req.files) {
      const uploadsDir = path.join(process.cwd(), "backend", "src", "uploads");
      const relPath = path.relative(uploadsDir, file.path);
      const record = await createAttachment(
        noteId,
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        relPath,
      );
      saved.push(record);
    }
    handleResponse(res, 201, "Attachments uploaded", saved);
  } catch (err) {
    next(err);
  }
};

export const listAttachmentsForNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: noteId } = req.params;
    // verify ownership
    const noteCheck = await pool.query(
      "SELECT user_id FROM notes WHERE id=$1",
      [noteId],
    );
    if (!noteCheck.rows[0]) return handleResponse(res, 404, "Note not found");
    if (noteCheck.rows[0].user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    const attachments = await getAttachmentsByNote(noteId);
    handleResponse(res, 200, "Attachments retrieved", attachments);
  } catch (err) {
    next(err);
  }
};

export const downloadAttachment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // attachment id
    const attachment = await getAttachmentById(id);
    if (!attachment) return handleResponse(res, 404, "Attachment not found");
    if (attachment.user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    // Serve file directly from local storage
    const uploadsDir = path.join(process.cwd(), "backend", "src", "uploads");
    const filePath = path.join(uploadsDir, attachment.path);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

export const previewAttachment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // attachment id
    const attachment = await getAttachmentById(id);
    if (!attachment) return handleResponse(res, 404, "Attachment not found");
    if (attachment.user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    // Serve file directly from local storage
    const uploadsDir = path.join(process.cwd(), "backend", "src", "uploads");
    const filePath = path.join(uploadsDir, attachment.path);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

export const removeAttachment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // attachment id
    const attachment = await getAttachmentById(id);
    if (!attachment) return handleResponse(res, 404, "Attachment not found");
    if (attachment.user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    // delete file from local storage
    try {
      const uploadsDir = path.join(process.cwd(), "src", "uploads");
      const filePath = path.join(uploadsDir, attachment.path);
      await import("fs").then((fs) =>
        fs.promises.unlink(filePath).catch(() => {}),
      );
    } catch (e) {
      console.error("Error deleting local file", attachment.path, e);
    }

    const deleted = await deleteAttachmentById(id);
    handleResponse(res, 200, "Attachment deleted", deleted);
  } catch (err) {
    next(err);
  }
};

export default {
  createNote,
  getNotes,
  getNotesByDay,
  getNotesByMonth,
  getNotesByYear,
  updateNote,
  deleteNote,
  previewAttachment,
};
