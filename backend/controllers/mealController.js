const Meal = require("../models/Meal");
const User = require("../models/user");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const multer = require('multer');
const upload = multer();

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
exports.createMeal = [
  upload.single('mealPhoto'), // Use plain multer
  asyncHandler(async (req, res, next) => {
    try {
      req.body.price = parseFloat(req.body.price);
      req.body.availability = req.body.availability === 'true' || req.body.availability === true;
      // Upload to Cloudinary manually if file exists
      let photoUrl = '';
      if (req.file) {
        const { cloudinary } = require('../config/cloudinary');
        // Use a Promise to handle the upload_stream callback
        await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'mealmate/meals', resource_type: 'image' },
            (error, result) => {
              if (error) {
                reject(new ErrorResponse('Cloudinary upload failed', 500));
              } else {
                req.body.photo = result.secure_url;
                resolve();
              }
            }
          );
          stream.end(req.file.buffer);
        });
      }
      // For testing without authentication, set user and provider manually
      let fallbackUserId = null;
      if (!req.user) {
        // Find any user in the database
        const anyUser = await User.findOne();
        if (anyUser) {
          fallbackUserId = anyUser._id;
        }
      }
      req.body.user = req.body.user || fallbackUserId;
      req.body.provider = req.body.provider || fallbackUserId;
      Meal.create({ ...req.body, photo: req.body.photo || '' })
        .then(meal => res.status(201).json({ success: true, data: meal }))
        .catch(err => {
          console.error('Meal creation error:', err);
          res.status(500).json({ success: false, error: err.message, stack: err.stack });
        });
    } catch (err) {
      console.error('Meal creation error:', err);
      res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
  })
];

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private/Provider
exports.updateMeal = [
  upload.single('mealPhoto'),
  asyncHandler(async (req, res, next) => {
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

    // Handle image upload if new file is provided
    if (req.file) {
      const { cloudinary } = require('../config/cloudinary');
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'mealmate/meals', resource_type: 'image' },
          (error, result) => {
            if (error) {
              reject(new ErrorResponse('Cloudinary upload failed', 500));
            } else {
              req.body.photo = result.secure_url;
              resolve();
            }
          }
        );
        stream.end(req.file.buffer);
      });
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: meal,
    });
  })
];

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
