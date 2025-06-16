const Meal = require("../models/Meal");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all meals
// @route   GET /api/meals
// @access  Public

exports.getAllMeals = asyncHandler(async (req, res, next) => {
  const meals = await Meal.find().populate(
    "provider",
    "name email profilePhoto"
  );
  res.status(200).json({
    success: true,
    count: meals.length,
    data: meals,
  });
});

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Public
exports.getMealById = asyncHandler(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id).populate(
    "provider",
    "name email profilePhoto"
  );
  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: meal,
  });
});

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private/Provider
exports.createMeal = asyncHandler(async (req, res, next) => {
  // Add user and provider to req.body from authenticated user
  req.body.user = req.user.id;
  req.body.provider = req.user.id;

  const meal = await Meal.create(req.body);
  res.status(201).json({
    success: true,
    data: meal,
  });
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private/Provider
exports.updateMeal = asyncHandler(async (req, res, next) => {
  let meal = await Meal.findById(req.params.id);
  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
    );
  }

  if (meal.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this meal`,
        401
      )
    );
  }

  meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: meal,
  });
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private/Provider
exports.deleteMeal = asyncHandler(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);
  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.params.id}`, 404)
    );
  }

  if (meal.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this meal`,
        401
      )
    );
  }
  await Meal.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
