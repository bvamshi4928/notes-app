import {
  createLabelService,
  getUserLabelsService,
  updateLabelService,
  deleteLabelService,
  addLabelToNoteService,
  removeLabelFromNoteService,
  getNotesByLabelService,
} from "../models/labelModel.js";
import pool from "../config/db.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

export const createLabel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || !name.trim())
      return handleResponse(res, 400, "Label name required");

    const label = await createLabelService(userId, name.trim());
    handleResponse(res, 201, "Label created", label);
  } catch (err) {
    next(err);
  }
};

export const getUserLabels = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const labels = await getUserLabelsService(userId);
    handleResponse(res, 200, "Labels retrieved", labels);
  } catch (err) {
    next(err);
  }
};

export const updateLabel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim())
      return handleResponse(res, 400, "Label name required");

    const updated = await updateLabelService(id, userId, name.trim());
    if (!updated) return handleResponse(res, 404, "Label not found");
    handleResponse(res, 200, "Label updated", updated);
  } catch (err) {
    next(err);
  }
};

export const deleteLabel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deleted = await deleteLabelService(id, userId);
    if (!deleted) return handleResponse(res, 404, "Label not found");
    handleResponse(res, 200, "Label deleted", deleted);
  } catch (err) {
    next(err);
  }
};

export const addLabelToNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { noteId, labelId } = req.body;
    if (!noteId || !labelId)
      return handleResponse(res, 400, "Note ID and Label ID required");

    // verify note ownership
    const noteCheck = await pool.query(
      "SELECT user_id FROM notes WHERE id=$1",
      [noteId],
    );
    if (!noteCheck.rows[0]) return handleResponse(res, 404, "Note not found");
    if (noteCheck.rows[0].user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    // verify label ownership
    const labelCheck = await pool.query(
      "SELECT user_id FROM labels WHERE id=$1",
      [labelId],
    );
    if (!labelCheck.rows[0]) return handleResponse(res, 404, "Label not found");
    if (labelCheck.rows[0].user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    await addLabelToNoteService(noteId, labelId);
    handleResponse(res, 200, "Label added to note");
  } catch (err) {
    next(err);
  }
};

export const removeLabelFromNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { noteId, labelId } = req.params;

    // verify note ownership
    const noteCheck = await pool.query(
      "SELECT user_id FROM notes WHERE id=$1",
      [noteId],
    );
    if (!noteCheck.rows[0]) return handleResponse(res, 404, "Note not found");
    if (noteCheck.rows[0].user_id !== userId)
      return handleResponse(res, 403, "Not authorized");

    await removeLabelFromNoteService(noteId, labelId);
    handleResponse(res, 200, "Label removed from note");
  } catch (err) {
    next(err);
  }
};

export const getNotesByLabel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const notes = await getNotesByLabelService(userId, id);
    // Attach attachments to each note
    const { getAttachmentsByNote } =
      await import("../models/attachmentModel.js");
    const notesWithAttachments = await Promise.all(
      notes.map(async (note) => ({
        ...note,
        attachments: await getAttachmentsByNote(note.id),
      })),
    );
    handleResponse(res, 200, "Notes retrieved", notesWithAttachments);
  } catch (err) {
    next(err);
  }
};

export default {
  createLabel,
  getUserLabels,
  updateLabel,
  deleteLabel,
  addLabelToNote,
  removeLabelFromNote,
  getNotesByLabel,
};
