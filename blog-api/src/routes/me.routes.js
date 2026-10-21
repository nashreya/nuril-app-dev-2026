const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const { listMyPosts } = require("../controllers/post.controller");

router.get("/posts", authenticate, listMyPosts); // any logged-in user

module.exports = router;
