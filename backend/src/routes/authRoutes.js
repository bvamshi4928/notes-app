import express from "express";
import {
  signup,
  signin,
  signout,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/profile", authenticate, getProfile);
router.put("/password", authenticate, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
