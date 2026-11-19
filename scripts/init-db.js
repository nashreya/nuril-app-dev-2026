// Runs database/schema.sql against MariaDB (same as importing it in phpMyAdmin).
// WARNING: the script drops and recreates the tables.
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  await conn.query(fs.readFileSync(path.join(__dirname, "..", "database", "schema.sql"), "utf8"));
  await conn.end();
  console.log("Database and tables created (roles seeded: reader, author, admin).");
})().catch((err) => {
  console.error("init-db failed:", err.code || err.message);
  process.exit(1);
});
