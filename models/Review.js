const mongoose = require("mongoose");
const slugify = require("slugify");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add a text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp", // which model
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // which model
    required: true,
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
