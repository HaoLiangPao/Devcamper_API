// @ToDo: change ownership check to a method so we do not have to repeat ourselve again and again

const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geoCoder = require("../utils/geocoder");
const BootCamp = require("../models/Bootcamp");

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults); // could get results send by this middleware function in this way
});
// @desc        Get a single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootCamp = await BootCamp.findById(req.params.id);
  if (!bootCamp) {
    return next(
      new ErrorResponse(`Bootcamp id: ${req.params.id} is invalid!`, 400)
    ); // Bad request
  }
  res.status(200).json({ success: true, data: bootCamp });
});
// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Cal radius using radius
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi or 6,378 km
  const radius = distance / 6378;

  const bootcamps = await BootCamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
// @desc        Create a new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootCamp = asyncHandler(async (req, res, next) => {
  // Add userID fetched from req.user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await BootCamp.findOne({ user: req.user.id });

  // If the user is not admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootCamp = await BootCamp.create(req.body);
  res.status(201).json({ success: true, data: bootCamp });
});
// @desc        Update a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  let bootCamp = await BootCamp.findById(req.params.id);
  if (!bootCamp) {
    return next(
      new ErrorResponse(`Bootcamp id: ${req.params.id} is invalid!`, 400)
    ); // Bad request
  }

  // Make sure logged in user owns the bootcamp he/she wants to update
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootCamp = await BootCamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootCamp });
});
// @desc        Delete a bootcamp
// @route       Get /api/v1/bootcamps/:id
// @access      Public
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  // trigger the middleare function before remove the document
  const bootCamp = await BootCamp.findById(req.params.id);
  if (!bootCamp) {
    return next(
      new ErrorResponse(`Bootcamp id: ${req.params.id} is invalid!`, 400)
    ); // Bad request
  }

  // Make sure logged in user owns the bootcamp he/she wants to update
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootCamp.remove();
  res.status(200).json({ success: true, msg: "BootCamp deleted", data: {} });
});

// @desc        Upload a photo for a bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // trigger the middleare function before update the document
  const bootCamp = await BootCamp.findById(req.params.id);
  if (!bootCamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    ); // Bad request
  }
  // Make sure logged in user owns the bootcamp he/she wants to update
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }
  const file = req.files.file;
  // Check if a file uploaded
  if (!file) {
    return next(new ErrorResponse("Please upload a file", 400));
  }
  // Check if the file uploaded is a photo
  if (!file.mimetype.startsWith("image/")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }
  // Set the size limit for the file uploaded
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  // Prevent unwanted overwritten example: "photo_{bootcampid}_extention"
  file.name = `photo_${bootCamp.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    // Update the database, add photo name into it
    await BootCamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res
      .status(200)
      .json({ success: true, msg: "Photo uploaded", data: file.name });
  });
});
