const User = require("../models/user.model");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyToken } = require("../utils/tokens");

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body || {};

    if (!isNonEmptyString(username) || !isNonEmptyString(password) || !isNonEmptyString(role)) {
      return res.status(400).json({ error: "username, password and role are required" });
    }
    if (!User.ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${User.ROLES.join(", ")}` });
    }
    if (User.findByUsername(username.trim())) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    const user = User.create({
      username: username.trim(),
      hashed_password: await hashPassword(password),
      role,
    });

    // Never send hashed_password or refresh_token back
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = User.findByUsername(username.trim());
    // Same message whether the user or the password was wrong
    if (!user || !(await verifyPassword(password, user.hashed_password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    User.setRefreshToken(user, refreshToken); // stores token, clears revoked_at

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
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

    // 3. Must match what we stored at login (logout clears it, a newer login replaces it)
    const user = User.findById(payload.id);
    if (!user || !user.refresh_token || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: "Refresh token has been revoked" });
    }

    res.status(200).json({ accessToken: signAccessToken(user) });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!isNonEmptyString(refreshToken)) {
      return res.status(400).json({ error: "refreshToken is required" });
    }

    // Idempotent: an unknown or already-revoked token still counts as logged out
    const user = User.findByRefreshToken(refreshToken);
    if (user) User.revokeRefreshToken(user);

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
