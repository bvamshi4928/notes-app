import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  let token;

  // Try to get token from Authorization header first
  if (auth && auth.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }
  // Fallback to query parameter for image tags
  else if (req.query.token) {
    token = req.query.token;
  } else {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // check revoked tokens
    try {
      const r = await pool.query(
        "SELECT token FROM revoked_tokens WHERE token=$1",
        [token]
      );
      if (r.rows && r.rows.length > 0) {
        return res.status(401).json({ status: 401, message: "Token revoked" });
      }
    } catch (err) {
      console.error("Error checking revoked tokens", err);
      // allow request to proceed if DB check fails? safer to block
      return res
        .status(500)
        .json({ status: 500, message: "Auth service error" });
    }

    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, message: "Invalid token" });
  }
};

export default authenticate;
