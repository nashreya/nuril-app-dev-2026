const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const { listPosts, getPost, createPost, updatePost, deletePost } = require("../controllers/post.controller");

// Public: no authenticate here
router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPost));

// Protected: authenticate is applied per route
router.post("/", authenticate, authorize("author", "admin"), asyncHandler(createPost));
router.put("/:id", authenticate, asyncHandler(updatePost));                       // owner-or-admin check is in the controller
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(deletePost));

module.exports = router;
