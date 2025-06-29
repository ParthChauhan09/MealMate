const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tiffinSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack", "beverage"],
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  provider:{
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  photo: {
    type: String, // Cloudinary URL
    default: '',
  }
});

module.exports = mongoose.model("Meal", tiffinSchema);
