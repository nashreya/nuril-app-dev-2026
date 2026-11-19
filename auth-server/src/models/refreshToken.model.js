const db = require("../../db");

exports.create = async ({ userId, tokenHash, expiresAt }) => {
  await db.query("INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [
    userId,
    tokenHash,
    expiresAt,
  ]);
};

exports.findByHash = async (tokenHash) => {
  const [rows] = await db.query("SELECT * FROM refresh_tokens WHERE token_hash = ?", [tokenHash]);
  return rows[0];
};

// Logout: stamp revoked_at (only the first time, so the original revoke time is kept)
exports.revoke = async (tokenHash) => {
  await db.query("UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL", [
    new Date(),
    tokenHash,
  ]);
};
