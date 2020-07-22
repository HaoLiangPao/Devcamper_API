const express = require("express");

const {
  getUser,
  getUsers,
  updateUser,
  createUser,
  deleteUser,
} = require("../controllers/users");

const router = express.Router();

const User = require("../models/User");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

// Use protect and authorize on all routes defined in this router
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).delete(deleteUser).put(updateUser);

module.exports = router;
