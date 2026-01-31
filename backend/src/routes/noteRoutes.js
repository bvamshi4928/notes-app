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

// Removed S3 upload storage comment
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "src", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
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
