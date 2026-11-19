const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Both token kinds use the SAME secret (read at call time, after dotenv has loaded).
const secret = () => process.env.JWT_SECRET;
const ALG = { algorithm: "HS256" };

// Access token: { id, username, role }, 15 minutes by default
exports.signAccessToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role }, secret(), {
    ...ALG,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });

// Refresh token: same secret, marked type:"refresh" so the Blog API can reject it on sight.
// jti makes every token (and therefore every stored hash) unique.
exports.signRefreshToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, type: "refresh" }, secret(), {
    ...ALG,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    jwtid: crypto.randomUUID(),
  });

exports.verifyToken = (token) => jwt.verify(token, secret(), { algorithms: ["HS256"] });

// Only this SHA-256 hash goes in the refresh_tokens table (CHAR(64)), never the raw token
exports.hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
