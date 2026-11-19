// Adds demo users and posts so the tables have data to show. Safe to run more than once.
// Every demo account uses the password below.
const path = require("path");
const db = require("../auth-server/db");
const { hashPassword } = require("../auth-server/src/utils/password");

const PASSWORD = "Password123!";
const USERS = [
  { username: "admin", email: "admin@example.com", role: "admin" },
  { username: "alice", email: "alice@example.com", role: "author" },
  { username: "bob", email: "bob@example.com", role: "author" },
  { username: "reader", email: "reader@example.com", role: "reader" },
];
const POSTS = [
  { by: "alice", title: "Welcome to the Blog Platform", content: "This post was written by an author. Anyone can read it without logging in." },
  { by: "alice", title: "How JWT access and refresh tokens work", content: "The access token lives 15 minutes. The refresh token lives 7 days and only its SHA-256 hash is stored in the database." },
  { by: "bob", title: "Role-based access control in Express", content: "Readers can only read. Authors can write and edit their own posts. Admins can edit and delete anything." },
  { by: "admin", title: "House rules", content: "Be kind. Admins can remove posts that break the rules." },
];

(async () => {
  const hash = await hashPassword(PASSWORD);
  for (const u of USERS) {
    await db.query(
      "INSERT IGNORE INTO users (email, username, password_hash, role_id) SELECT ?, ?, ?, id FROM roles WHERE role = ?",
      [u.email, u.username, hash, u.role]
    );
  }
  const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM posts");
  if (n === 0) {
    for (const p of POSTS) {
      await db.query("INSERT INTO posts (author_id, title, content) SELECT id, ?, ? FROM users WHERE username = ?", [
        p.title,
        p.content,
        p.by,
      ]);
    }
  }
  console.log(`Seeded users (${USERS.map((u) => u.username).join(", ")}) with password "${PASSWORD}".`);
  await db.end();
})().catch((err) => {
  console.error("seed failed:", err.code || err.message);
  process.exit(1);
});
