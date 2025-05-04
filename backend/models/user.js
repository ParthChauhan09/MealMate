const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["customer", "provider", "admin"],
    default: "customer",
  },
  phone: {
    type: String,
    required: false,
    match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
  },
  address: {
    type: String,
    required: false,
  },
  profilePhoto: {
    type: String,
    default: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg", // Default placeholder image
  },
});

module.exports = mongoose.model("User", UserSchema);
