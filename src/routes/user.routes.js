const router = require("express").Router();
const auth = require("../middleware/auth");
const { getAboutMe, getAllUsers } = require("../controllers/user.controller");

// Every route below needs a valid, unexpired token
router.get("/about-me", auth, getAboutMe); // GET /api/users/about-me
router.get("/", auth, getAllUsers);        // GET /api/users

module.exports = router;
