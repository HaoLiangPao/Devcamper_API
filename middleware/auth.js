const jwt = require("jsonwebtoken");
const asyncHander = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHander(async (req, res, next) => {
  let token;

  // Get the token passed within header / or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in hearder
    token = req.headers.authorization.split(" ")[1];
    // Set token from cookie if no Bearer token foound in header (could be turn on after deployment)
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Set res.user which will be fetched by GET_ME action defiend in auth controller
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check the role of the user(return from protect())
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role: (${req.user.role}) is not authorized to access this route`,
          403
        )
      ); // forbidden error
    }
    next();
  };
};
