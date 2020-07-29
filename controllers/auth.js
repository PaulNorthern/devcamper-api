const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc      Refister user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  // MONGOOSE returns a promise
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email or passwrod", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password"); // included password

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token (lowercase coz method not a static)
  const token = user.getSignedJwtToken();

  const options = {
    // 30 days from this time
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // accessed thhoruh client side
  };

  if (process.env.NOVNODE_ENVE === "production") {
    options.secure = true;
  }

  // send cookie
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
