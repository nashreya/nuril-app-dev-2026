const path = require("path");
const express = require("express");
const { users, nextId } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

function isEmpty(value) {
  return typeof value !== "string" || value.trim() === "";
}

app.post("/api/signup", (req, res) => {
  const { email, username, password } = req.body || {};

  const missing = [];
  if (isEmpty(email)) missing.push("email");
  if (isEmpty(username)) missing.push("username");
  if (isEmpty(password)) missing.push("password");

  if (missing.length > 0) {
    return res.status(400).json({
      message: `These fields can't be empty: ${missing.join(", ")}.`,
      fields: missing
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  const taken = users.find(
    (user) =>
      user.username.toLowerCase() === cleanUsername.toLowerCase() ||
      user.email.toLowerCase() === cleanEmail
  );

  if (taken) {
    const conflict =
      taken.username.toLowerCase() === cleanUsername.toLowerCase()
        ? "username"
        : "email";
    return res.status(409).json({
      message: `That ${conflict} is already registered. Try logging in instead.`,
      field: conflict
    });
  }

  const newUser = {
    id: nextId(),
    email: cleanEmail,
    username: cleanUsername,
    password: password 
  };

  users.push(newUser);
  console.log(users);

  return res.status(201).json({
    message: "Account created.",
    user: { id: newUser.id, email: newUser.email, username: newUser.username }
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};

  const missing = [];
  if (isEmpty(username)) missing.push("username");
  if (isEmpty(password)) missing.push("password");

  if (missing.length > 0) {
    return res.status(400).json({
      message: `These fields can't be empty: ${missing.join(", ")}.`,
      fields: missing
    });
  }

  const match = users.find(
    (user) =>
      user.username.toLowerCase() === username.trim().toLowerCase() &&
      user.password === password
  );

  if (!match) {
    return res.status(401).json({
      message: "That username and password don't match any account."
    });
  }

  return res.status(200).json({
    message: "Signed in.",
    user: { id: match.id, email: match.email, username: match.username }
  });
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});