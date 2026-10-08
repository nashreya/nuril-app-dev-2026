const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization; // expected: "Bearer <token>"
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // checks signature + expiry
    next();
  } catch (err) {
    const error = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ error });
  }
};
