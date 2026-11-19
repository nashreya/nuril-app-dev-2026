const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyToken, hashToken } = require("../utils/tokens");

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE = "refreshToken";

// The refresh token is also sent as an httpOnly cookie so the React app never touches it in JS.
// Postman / API clients can still send it in the JSON body.
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

const readRefreshToken = (req) => (req.body && req.body.refreshToken) || (req.cookies && req.cookies[COOKIE]);

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (![username, email, password, role].every(isNonEmptyString)) {
    return res.status(400).json({ error: "username, email, password and role are required" });
  }
  if (!User.ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${User.ROLES.join(", ")}` });
  }
  if (username.trim().length > 50 || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "username must be at most 50 characters and email must be valid" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }

  const name = username.trim();
  const mail = email.trim().toLowerCase();
  if (await User.exists(name, mail)) {
    return res.status(409).json({ error: "Username or email is already taken" });
  }

  try {
    const id = await User.create({ email: mail, username: name, password_hash: await hashPassword(password), role });
    // Never send password_hash back
    res.status(201).json({ id, username: name, email: mail, role });
  } catch (err) {
    // Two requests racing past the exists() check are still stopped by the UNIQUE keys
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Username or email is already taken" });
    throw err;
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const user = await User.findByUsername(username.trim());
  // Same message whether the user or the password was wrong
  if (!user || !(await verifyPassword(password, user.password_hash)) || !user.is_active) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const { exp } = verifyToken(refreshToken);

  // Store only the hash. Several rows per user = several devices can be logged in.
  await RefreshToken.create({ userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: new Date(exp * 1000) });

  res.cookie(COOKIE, refreshToken, { ...cookieOptions(), maxAge: exp * 1000 - Date.now() });
  res.status(200).json({ accessToken, refreshToken });
};

exports.refresh = async (req, res) => {
  const refreshToken = readRefreshToken(req);
  if (!isNonEmptyString(refreshToken)) {
    return res.status(400).json({ error: "refreshToken is required" });
  }

  // 1. Signature + expiry
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  // 2. Must be a refresh token (an access token must not work here)
  if (payload.type !== "refresh") {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  // 3. Must exist in the table, not be revoked, not be expired
  const stored = await RefreshToken.findByHash(hashToken(refreshToken));
  if (!stored || stored.user_id !== payload.id) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
  if (stored.revoked_at) {
    return res.status(401).json({ error: "Refresh token has been revoked" });
  }
  if (stored.expires_at <= new Date()) {
    return res.status(401).json({ error: "Refresh token has expired" });
  }

  // 4. Re-read the user so a changed role or a disabled account takes effect
  const user = await User.findById(payload.id);
  if (!user || !user.is_active) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  res.status(200).json({ accessToken: signAccessToken(user) });
};

exports.logout = async (req, res) => {
  const refreshToken = readRefreshToken(req);
  if (!isNonEmptyString(refreshToken)) {
    return res.status(400).json({ error: "refreshToken is required" });
  }

  // Idempotent: an unknown or already-revoked token still counts as logged out
  await RefreshToken.revoke(hashToken(refreshToken));
  res.clearCookie(COOKIE, cookieOptions());
  res.status(200).json({ message: "Logged out" });
};
