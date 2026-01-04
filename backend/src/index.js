import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import { createLabelService } from "./models/labelModel.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

//middleware
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/labels", labelRoutes);

//errorhandling middleware
app.use(errorHandling);

// Initialize database tables in correct order
(async () => {
  try {
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
  }
})();

//testing postgres connnection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`the database name is ${result.rows[0].current_database}`);
});

//server running

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
