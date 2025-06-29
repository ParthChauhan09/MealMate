const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Review Schema
const ReviewSchema = new Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  meal: {
    type: Schema.Types.ObjectId,
    ref: "Meal",
    required: true,
  },
  photos: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
