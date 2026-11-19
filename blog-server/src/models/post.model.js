const db = require("../../db");

// authorId is what the API exposes; the column is author_id. Author name comes from users.
const SELECT = `
  SELECT p.id, p.author_id AS authorId, u.username AS authorName,
         p.title, p.content, p.created_at, p.updated_at
  FROM posts p JOIN users u ON u.id = p.author_id`;

exports.findAll = async () => {
  const [rows] = await db.query(`${SELECT} ORDER BY p.created_at DESC, p.id DESC`);
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.query(`${SELECT} WHERE p.id = ?`, [id]);
  return rows[0];
};

exports.findByAuthor = async (authorId) => {
  const [rows] = await db.query(`${SELECT} WHERE p.author_id = ? ORDER BY p.created_at DESC, p.id DESC`, [authorId]);
  return rows;
};

exports.create = async ({ authorId, title, content }) => {
  const [result] = await db.query("INSERT INTO posts (author_id, title, content) VALUES (?, ?, ?)", [
    authorId,
    title,
    content,
  ]);
  return exports.findById(result.insertId);
};

exports.update = async (id, { title, content }) => {
  // COALESCE keeps the old value for a field that was not sent
  await db.query("UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?", [
    title ?? null,
    content ?? null,
    id,
  ]);
  return exports.findById(id);
};

exports.remove = async (id) => {
  await db.query("DELETE FROM posts WHERE id = ?", [id]);
};
