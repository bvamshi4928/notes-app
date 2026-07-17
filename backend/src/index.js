import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import errorHandling from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import labelRoutes from "./routes/labelRoutes.js";

import createUserTable from "./data/createUserTable.js";
import createNotesTable from "./data/createNotesTable.js";
import createRevokedTokensTable from "./data/createRevokedTokensTable.js";
import createAttachmentsTable from "./data/createAttachmentsTable.js";
import createLabelsTable from "./data/createLabelsTable.js";
import ensureDatabase from "./data/ensureDatabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "uploads");
const frontendDistDir = path.resolve(__dirname, "../../frontend/dist");
const frontendIndexFile = path.join(frontendDistDir, "index.html");

const app = express();
const port = process.env.PORT || 5001;

//baseline

//middleware
app.use(express.json());
app.use(cors());
// Serve uploads as static files
app.use(
  "/uploads",
  express.static(uploadsDir),
);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/labels", labelRoutes);

// Initialize database and tables before accepting requests.
(async () => {
  try {
    await ensureDatabase();
    //create user table if not exists
    await createUserTable();
    //create notes table if not exists
    await createNotesTable();
    //create revoked tokens table if not exists
    await createRevokedTokensTable();
    //create attachments table if not exists
    await createAttachmentsTable();
    //create labels table if not exists
    await createLabelsTable();
    console.log("All database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
    process.exitCode = 1;
  }
})();

// API health check
app.get("/api/health/db", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`the database name is ${result.rows[0].current_database}`);
});

// Serve built frontend from backend in single-server mode.
if (existsSync(frontendIndexFile)) {
  app.use(express.static(frontendDistDir));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(frontendIndexFile);
  });
} else {
  app.get("/", (req, res) => {
    res.send("Frontend build not found. Build frontend with: npm run build");
  });
}

//errorhandling middleware
app.use(errorHandling);

//server running

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
