// authorize("author", "admin") -> 403 unless req.user.role is one of them. Use after authenticate.
module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have permission to do this" });
  }
  next();
};
