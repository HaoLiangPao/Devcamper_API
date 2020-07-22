const express = require("express");

// Get route functions from controller
const {
  getBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

// Get advanced GET query handler as a middleware function
const BootCamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");
// Get authentification middleware function
const { protect, authorize } = require("../middleware/auth");

// Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

// Initialize the router
const router = express.Router();

// Routes handling
// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(BootCamp, "courses"), getBootCamps) // run the middleware function before getBootCamps(), so that we have pagination and other advanced stuff implemented
  .post(protect, createBootCamp);

router
  .route("/:id")
  .get(getBootCamp)
  .put(protect, authorize("publisher", "admin"), updateBootCamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootCamp);

module.exports = router;
