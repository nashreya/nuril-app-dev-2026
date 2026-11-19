const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // same root .env as the Auth Server

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Copy .env.example to .env at the project root and set it.");
  process.exit(1);
}

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./db");
const postRoutes = require("./src/routes/post.routes");
const meRoutes = require("./src/routes/me.routes");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.BLOG_RATE_LIMIT_MAX) || 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
  })
);
app.use(express.json());
app.use("/api/posts", postRoutes);
app.use("/api/me", meRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.BLOG_PORT) || 5000;
db.verifyConnection().then(() =>
  app.listen(PORT, () => console.log(`Blog Server listening on http://localhost:${PORT}`))
);
