const Review = require("../models/Review");
const Meal = require("../models/meal");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const config = require("../config/config");

// @desc    Get reviews for a meal
// @route   GET /api/meals/:mealId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.mealId) {
    const reviews = await Review.find({ meal: req.params.mealId }).populate({
      path: "user",
      select: "name",
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "user",
    select: "name",
  });

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add review for a meal
// @route   POST /api/meals/:mealId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.meal = req.params.mealId;
  req.body.user = req.user.id;

  const meal = await Meal.findById(req.params.mealId);

  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.mealId}`, 404)
    );
  }

  // Check if user has already reviewed this meal
  const existingReview = await Review.findOne({
    user: req.user.id,
    meal: req.params.mealId,
  });

  if (existingReview) {
    return next(new ErrorResponse("You have already reviewed this meal", 400));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== config.roles.ADMIN
  ) {
    return next(new ErrorResponse("Not authorized to update this review", 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== config.roles.ADMIN
  ) {
    return next(new ErrorResponse("Not authorized to delete this review", 401));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
