const db = require("../../db");

exports.ROLES = ["reader", "author", "admin"];

// Users are returned with their role NAME (joined from the roles table)
const SELECT = `
  SELECT u.id, u.email, u.username, u.password_hash, u.is_active, r.role
  FROM users u JOIN roles r ON r.id = u.role_id`;

exports.findByUsername = async (username) => {
  const [rows] = await db.query(`${SELECT} WHERE u.username = ?`, [username]);
  return rows[0];
};

exports.findById = async (id) => {
  const [rows] = await db.query(`${SELECT} WHERE u.id = ?`, [id]);
  return rows[0];
};

// Is either the username or the email already used?
exports.exists = async (username, email) => {
  const [rows] = await db.query("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", [username, email]);
  return rows.length > 0;
};

exports.create = async ({ email, username, password_hash, role }) => {
  const [result] = await db.query(
    "INSERT INTO users (email, username, password_hash, role_id) SELECT ?, ?, ?, id FROM roles WHERE role = ?",
    [email, username, password_hash, role]
  );
  return result.insertId;
};
