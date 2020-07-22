const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const BootCamp = require("../models/Bootcamp");

// @desc        Get all courses
// @route 1     GET /api/v1/courses
// @route 2     GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // route 1: Get all courses with the bootcampId given
  if (req.params.bootcampId) {
    const bootcamp = await BootCamp.findById(req.params.bootcampId);
    // Check if bootcamp exists
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `No bootcamp found with the id of ${req.params.bootcampId}, please check id`,
          404
        )
      );
    }
    // Check if any courses related to the bootcamp
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  }
  // route 2: Get all courses, populate the reference with document information in certain types
  else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc        Get a single course
// @route       GET /api/v1/courses/:id
// @route       GET /api/v1/bootcamps/:bootcampId/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    //@To-Do: add multiple queries here to get specific course given the bootcamp
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.findById(req.params.id).populate({
      path: "bootcamp",
      select: "name description",
    });
  }

  const courses = await query;

  if (!courses) {
    return next(
      new ErrorResponse(
        `No resources found with id of ${req.params.id}, please check the id`
      )
    );
  }

  res.status(200).json({
    success: true,
    data: courses,
  });
});

// @desc        Add a course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // Add ownership to the new course
  req.body.user = req.user.id;
  // Add to body field
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await BootCamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with the id of ${req.params.bootcampId}, please check id`,
        404
      )
    );
  }

  // Make sure the logged in user is the owner of the bootcamp
  if (req.user.id !== bootcamp.user.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${req.params.bootcampId}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc        Update a course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  // Course id not exists
  if (!course) {
    return next(
      new ErrorResponse(
        `No course found with the id of ${req.params.id}, please check id`,
        404
      )
    );
  }
  // Make sure the logged in user is the owner of the course
  if (req.user.id !== course.user.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course with id of ${req.params.id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc        Delete a course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  // Course id not exists
  if (!course) {
    return {
      success: false,
      data: new ErrorResponse(
        `No course found with the id of ${req.params.id}, please check id`,
        404
      ),
    };
  }
  // Make sure the logged in user is the owner of the course
  if (req.user.id !== course.user.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course with id of ${req.params.id}`,
        401
      )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    msg: "Course deleted",
    data: {},
  });
});
