import pool from "../config/db.js";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// Helper to convert S3 key to public URL
const getS3PublicUrl = (s3Key) => {
  return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;
};

export const createAttachment = async (
  noteId,
  filename,
  originalName,
  mimeType,
  size,
  path
) => {
  const result = await pool.query(
    `INSERT INTO attachments (note_id, filename, original_name, mime_type, size, path) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [noteId, filename, originalName, mimeType, size, path]
  );
  return result.rows[0];
};

export const getAttachmentById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, n.user_id FROM attachments a JOIN notes n ON a.note_id = n.id WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getAttachmentsByNote = async (noteId) => {
  const result = await pool.query(
    `SELECT a.* FROM attachments a WHERE a.note_id = $1 ORDER BY created_at DESC`,
    [noteId]
  );
  // Add public S3 URL to each attachment
  return result.rows.map((attachment) => ({
    ...attachment,
    s3_url: getS3PublicUrl(attachment.path),
  }));
};

export const deleteAttachmentById = async (id) => {
  const result = await pool.query(
    `DELETE FROM attachments WHERE id=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export default {
  createAttachment,
  getAttachmentById,
  deleteAttachmentById,
};
