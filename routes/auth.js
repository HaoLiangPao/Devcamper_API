const express = require("express");

// Get actions from controller
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetail,
  updatePassword,
} = require("../controllers/auth");
// Get authorized middleware function
const { protect } = require("../middleware/auth");

// Initialize the router
const router = express.Router();

// Define the routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetail);
router.put("/updatepassword", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

// Export router to be used in server.js
module.exports = router;
