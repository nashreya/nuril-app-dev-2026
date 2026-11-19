const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const asyncHandler = require("../middleware/asyncHandler");
const { listMyPosts } = require("../controllers/post.controller");

router.get("/posts", authenticate, asyncHandler(listMyPosts)); // any logged-in user

module.exports = router;
