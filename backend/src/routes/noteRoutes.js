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
import path from "path";
import fs from "fs";

const router = express.Router();

router.use(authenticate);

// ensure uploads directory exists
const uploadsDir = path.resolve("src/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

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
