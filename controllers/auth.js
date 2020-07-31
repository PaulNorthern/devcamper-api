const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

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

// @desc      Get currnet logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  //   console.log(req.user, "++++");
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //   console.log(req.user, "++++");
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 400));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  //console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetpassword/${resetToken}`;

  const message = `Got email! ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email send" });
  } catch (err) {
    console.log(err);
    user.getResetPasswordToken = undefined;
    user.getResetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be send", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
