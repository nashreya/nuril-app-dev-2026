// Users live in an in-memory array. It is loaded from localStorage at startup and saved back
// after every change. Shape: { id, username, hashed_password, role, refresh_token, created_at, revoked_at }
const storage = require("../utils/localStorage");

const KEY = "users";

function load() {
  try {
    const parsed = JSON.parse(storage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const users = load();
let nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;

const save = () => storage.setItem(KEY, JSON.stringify(users));

exports.ROLES = ["reader", "author", "admin"];

exports.findByUsername = (username) =>
  users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());

exports.findById = (id) => users.find((u) => u.id === id);

exports.create = ({ username, hashed_password, role }) => {
  const user = {
    id: nextId++,
    username,
    hashed_password,
    role,
    refresh_token: null,
    created_at: new Date().toISOString(),
    revoked_at: null,
  };
  users.push(user);
  save();
  return user;
};

// Login: store the refresh token and wipe revoked_at
exports.setRefreshToken = (user, token) => {
  user.refresh_token = token;
  user.revoked_at = null;
  save();
};

// Logout: drop the refresh token and stamp revoked_at
exports.revokeRefreshToken = (user) => {
  user.refresh_token = null;
  user.revoked_at = new Date().toISOString();
  save();
};

exports.findByRefreshToken = (token) => users.find((u) => u.refresh_token === token);
