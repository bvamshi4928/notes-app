import express from "express";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  getArchivedNotes,
  getTrashedNotes,
  restoreNote,
  permanentDeleteNote,
  uploadAttachments,
  downloadAttachment,
  previewAttachment,
  removeAttachment,
  listAttachmentsForNote,
  getNotesByDay,
  getNotesByMonth,
  getNotesByYear,
} from "../controller/noteController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

router.use(authenticate);

// Use memory storage for S3 uploads (no local disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/", upload.single("image"), createNote);
router.get("/", getNotes);
router.put("/:id", upload.single("image"), updateNote);
router.delete("/:id", deleteNote);
router.patch("/:id/pin", togglePin);
router.patch("/:id/archive", toggleArchive);
router.get("/archived", getArchivedNotes);
router.get("/trash", getTrashedNotes);
router.patch("/:id/restore", restoreNote);
router.delete("/:id/permanent", permanentDeleteNote);
router.get("/day/:date", getNotesByDay);
router.get("/month/:year/:month", getNotesByMonth);
router.get("/year/:year", getNotesByYear);

// Attachments: upload multiple files for a note
router.post("/:id/attachments", upload.array("files", 8), uploadAttachments);
// List attachments for a note
router.get("/:id/attachments", listAttachmentsForNote);
// Download an attachment by attachment id
router.get("/attachments/:id", downloadAttachment);
// Preview an attachment (inline display)
router.get("/attachments/:id/preview", previewAttachment);
// Delete an attachment
router.delete("/attachments/:id", removeAttachment);

export default router;
