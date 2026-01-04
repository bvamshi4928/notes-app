import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import {
  createUserService,
  getUserByEmailService,
  updateUserPasswordService,
  getUserByIdService,
} from "../models/userModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

//Signup Controller
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return handleResponse(res, 400, "Missing fields");

    const existing = await getUserByEmailService(email);
    if (existing) return handleResponse(res, 409, "Email already in use");

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUserService(name, email, hashed);
    handleResponse(res, 201, "User created", {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

//Login Controller
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return handleResponse(res, 400, "Missing fields");

    const user = await getUserByEmailService(email);
    if (!user) return handleResponse(res, 401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) return handleResponse(res, 401, "Invalid credentials");

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    handleResponse(res, 200, "Login successful", { token });
  } catch (err) {
    next(err);
  }
};

//Signout Controller
export const signout = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer"))
      return handleResponse(res, 400, "No token provided");

    const token = auth.split(" ")[1];
    // verify token to extract expiry
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    } catch (err) {
      // invalid token: nothing to revoke
      return handleResponse(res, 200, "Signed out");
    }

    const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;

    try {
      await pool.query(
        "INSERT INTO revoked_tokens(token, expires_at) VALUES ($1,$2) ON CONFLICT (token) DO NOTHING",
        [token, expiresAt]
      );
    } catch (err) {
      console.error("Error inserting revoked token:", err);
    }

    return handleResponse(res, 200, "Signed out");
  } catch (err) {
    next(err);
  }
};

// Get profile (authenticated)
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const user = await getUserByIdService(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    return handleResponse(res, 200, "Profile retrieved", {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

// Change password (authenticated)
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) return handleResponse(res, 401, "Unauthorized");
    if (!currentPassword || !newPassword)
      return handleResponse(res, 400, "Missing fields");

    const user = await getUserByIdService(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    const ok = await bcrypt.compare(currentPassword, user.password || "");
    if (!ok) return handleResponse(res, 401, "Invalid current password");

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await updateUserPasswordService(userId, hashed);
    return handleResponse(res, 200, "Password updated", { id: updated.id });
  } catch (err) {
    next(err);
  }
};

// Forgot password - generate reset token
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return handleResponse(res, 400, "Email is required");

    const user = await getUserByEmailService(email);
    if (!user) {
      // Don't reveal if email exists
      return handleResponse(
        res,
        200,
        "If email exists, reset link will be sent"
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      "UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3",
      [hashedToken, expiresAt, user.id]
    );

    // In production, send email with resetToken
    // For demo, return token (NEVER do this in production)
    return handleResponse(res, 200, "Reset token generated", { resetToken });
  } catch (err) {
    next(err);
  }
};

// Reset password with token
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return handleResponse(res, 400, "Token and new password required");

    if (newPassword.length < 6)
      return handleResponse(res, 400, "Password must be at least 6 characters");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()",
      [hashedToken]
    );

    const user = result.rows[0];
    if (!user) return handleResponse(res, 400, "Invalid or expired token");

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2",
      [hashed, user.id]
    );

    return handleResponse(res, 200, "Password reset successful");
  } catch (err) {
    next(err);
  }
};

export default {
  signup,
  signin,
  signout,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
