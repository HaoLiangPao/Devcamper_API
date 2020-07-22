const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc        Get all users
// @route       GET /api/v1/users
// @access      Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
// @desc        Get a single users
// @route       GET /api/v1/users/:id
// @access      Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  // Get id passed in
  const user = await User.findById(req.params.id);
  // If no user found with the given id
  if (!user) {
    return next(
      new ErrorResponse(
        `User with id of ${req.params.id} does not exist, please check id`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: user });
});
// @desc        Create a user
// @route       POST /api/v1/users
// @access      Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  // Create user with given information
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});
// @desc        Update a user
// @route       PUT /api/v1/users/:id
// @access      Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Find the user
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(
        `User with id of ${req.params.id} does not exist, please check id`,
        404
      )
    );
  }

  // Create user with given information
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});
// @desc        Delete a user
// @route       DELETE /api/v1/users/:id
// @access      Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Find the user
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(
        `User with id of ${req.params.id} does not exist, please check id`,
        404
      )
    );
  }

  // remove the data from the database
  await user.remove();

  res.status(200).json({ success: true, data: {} });
});
