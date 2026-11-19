// MariaDB connection pool (mysql2). Credentials come from the shared root .env.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "blog_platform",
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z", // read/write JS Dates as UTC
});

// Keep the DB session in UTC too, so DATETIME columns always mean UTC
pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));

// Called at startup so a stopped XAMPP MariaDB gives a clear message instead of a stack trace
pool.verifyConnection = async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error(`Cannot connect to MariaDB (${err.code || err.message}).`);
    console.error("Start MySQL in the XAMPP Control Panel, import database/schema.sql, and check DB_* in .env.");
    process.exit(1);
  }
};

module.exports = pool;
