const jwt = require("jsonwebtoken");

// Verifies the Bearer token locally with the shared JWT_SECRET. Never calls the Auth Server.
module.exports = function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Refresh tokens are only for the Auth Server
  if (payload.type === "refresh") {
    return res.status(401).json({ error: "Refresh tokens cannot be used to access this API" });
  }

  req.user = { id: payload.id, username: payload.username, role: payload.role };
  next();
};
