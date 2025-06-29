const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    // Handle duplicate email
    if (err.code === 11000) {
      return next(new ErrorResponse("Email already exists", 400));
    }
    return next(err);
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile photo
// @route   PUT /api/users/:id/profile-photo
// @access  Private
exports.updateProfilePhoto = asyncHandler(async (req, res, next) => {
  // Check if a file was uploaded
  if (!req.body.profilePhoto) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { profilePhoto: req.body.profilePhoto },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    return next(new ErrorResponse("You cannot delete your own account", 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent deletion of other admin accounts (optional security measure)
  if (user.role === "admin" && req.user.role === "admin") {
    return next(new ErrorResponse("Cannot delete another admin account", 403));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `User ${user.name} has been deleted successfully`,
    data: {},
  });
});
