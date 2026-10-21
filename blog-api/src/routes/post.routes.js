const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { listPosts, getPost, createPost, updatePost, deletePost } = require("../controllers/post.controller");

// Public: no authenticate here
router.get("/", listPosts);
router.get("/:id", getPost);

// Protected: authenticate is applied per route
router.post("/", authenticate, authorize("author", "admin"), createPost);
router.put("/:id", authenticate, updatePost);                       // owner-or-admin check is in the controller
router.delete("/:id", authenticate, authorize("admin"), deletePost);

module.exports = router;
