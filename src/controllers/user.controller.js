const User = require("../models/user.model");

// Strip passwordHash (and anything else private) before sending a user to the client
const toPublic = (u) => ({ id: u.id, username: u.username, email: u.email, bio: u.bio });

// GET /api/users/about-me: details of the logged-in user
exports.getAboutMe = (req, res) => {
  const user = User.findById(req.user.userId); // req.user was set by the auth middleware
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(toPublic(user));
};

// GET /api/users: every registered user
exports.getAllUsers = (req, res) => {
  res.json(User.findAll().map(toPublic));
};
