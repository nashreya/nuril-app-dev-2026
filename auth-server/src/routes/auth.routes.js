const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const asyncHandler = require("../middleware/asyncHandler");
const { register, login, refresh, logout } = require("../controllers/auth.controller");

// Slow down password guessing and mass sign-ups
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

module.exports = router;
