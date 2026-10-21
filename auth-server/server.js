const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // shared root .env

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Copy .env.example to .env at the project root and set it.");
  process.exit(1);
}

const express = require("express");
const authRoutes = require("./src/routes/auth.routes");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
app.use(express.json());
app.use("/", authRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.AUTH_PORT) || 4000;
app.listen(PORT, () => console.log(`Auth Server listening on http://localhost:${PORT}`));
