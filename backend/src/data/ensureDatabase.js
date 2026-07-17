import { Client } from "pg";

const quoteIdentifier = (value) => `"${String(value).replace(/"/g, '""')}"`;

export const ensureDatabase = async () => {
  const databaseName = process.env.DB_DATABASE;
  if (!databaseName) {
    throw new Error("DB_DATABASE is not set");
  }

  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_ADMIN_DATABASE || "postgres",
  });

  try {
    await client.connect();

    const existsResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (existsResult.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`Database ${databaseName} created successfully`);
    }
  } finally {
    await client.end();
  }
};

export default ensureDatabase;