const express = require("express");

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");
const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

// Middleware function
const { protect, authorize } = require("../middleware/auth");
const advancedResult = require("../middleware/advancedResults");

// Defining the routes
router
  .route("/")
  .get(
    advancedResult(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview); // only users and admin can add reviews, not the publisher

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
