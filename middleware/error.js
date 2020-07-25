const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  // put all porperties from params to the variable
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongooser bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message); // for each value get message
    error = new ErrorResponse(message, 400);
  }

  // if (res.headersSent) {
  //   return next(err);
  // }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
  //res.render('error', { error: err });
};

module.exports = errorHandler;
