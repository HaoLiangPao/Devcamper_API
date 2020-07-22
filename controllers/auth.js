const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

// @desc        Register a user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  // Get parameters in request body
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});
// @desc        Login a user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  // Get parameters in request body
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password"); // password is deselect in schema settings
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // a helper function, which takes care of token storage with cookies
  sendTokenResponse(user, 200, res);
});
// @desc        Log out a user
// @route       GET /api/v1/auth/logout
// @access      Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, msg: "User logged out" });
});

// @desc        Get current logged in user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Fetch id of logged in user
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});
// @desc        Update user details
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetail = asyncHandler(async (req, res, next) => {
  // Get updated info
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  console.log(fieldsToUpdate);

  // Update in the database
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});
// @desc        Update password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // Get the current user in database
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }
  //
  user.password = req.body.newPassword;

  // Save to the database
  await user.save();

  // Auto login after the password is changed
  sendTokenResponse(user, 200, res);
});

// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Fetch email typed in for the user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(
        `No user was registered with the email ${req.body.email}`,
        404
      )
    );
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  // Save the user to the database
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  // Create message
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({
      success: true,
      data: `Email sent to ${req.body.email}, please check`,
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse(`Email could not be sent to ${req.body.email}`),
      500
    );
  }
});
// @desc        Reset password
// @route       PUT /api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get resetToken from request parameters
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Check the hashed token and validation of the token
  const user = await User.findOne({
    resetPasswordToken, // hashed value comparison
    resetPasswordExpire: { $gt: Date.now() }, // expired time and current time comparision
  });

  // If token not match or token expired
  if (!user) {
    return next(
      new ErrorResponse(
        `Invalid token or token expired, please reset the password again`,
        400
      )
    );
  }

  // Token validation passed, set new password to the password in input params
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save the user in the database
  await user.save();

  // Send back a token (automatically login the user)
  sendTokenResponse(user, 200, res);
});

// -- Helper Function --

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSingedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // only accessible from client script?
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
