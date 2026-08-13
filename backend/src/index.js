import express from "express";
import cors from "cors";
import pool from "./config/db.js";

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

const app = express();
const port = process.env.PORT || 5001;

//baseline

//middleware
app.use(express.json());
app.use(cors());

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

//errorhandling middleware
app.use(errorHandling);

//server running

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
