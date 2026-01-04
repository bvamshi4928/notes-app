import express from "express";
import {
  createLabel,
  getUserLabels,
  updateLabel,
  deleteLabel,
  addLabelToNote,
  removeLabelFromNote,
  getNotesByLabel,
} from "../controller/labelController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createLabel);
router.get("/", getUserLabels);
router.put("/:id", updateLabel);
router.delete("/:id", deleteLabel);
router.post("/note", addLabelToNote);
router.delete("/note/:noteId/:labelId", removeLabelFromNote);
router.get("/:id/notes", getNotesByLabel);

export default router;
