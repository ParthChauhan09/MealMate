const multer = require("multer");
const ErrorResponse = require("../utils/errorResponse");
const {
  uploadProfilePhoto,
  uploadReviewPhotos,
  uploadMealPhoto,
} = require("../config/cloudinary");

// Middleware for handling profile photo uploads
exports.uploadUserPhoto = (req, res, next) => {
  uploadProfilePhoto(req, res, (err) => {
    if (err) {
      return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
    }

    // If no file was uploaded, just continue
    if (!req.file) {
      return next();
    }

    // Add the file path to the request body
    req.body.profilePhoto = req.file.path;
    next();
  });
};

// Middleware for handling review photo uploads
exports.uploadReviewPhotos = (req, res, next) => {
  uploadReviewPhotos(req, res, (err) => {
    if (err) {
      return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
    }

    // If no files were uploaded, just continue
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Add the file paths to the request body
    req.body.photos = req.files.map((file) => file.path);
    next();
  });
};

// Middleware for handling meal photo uploads
exports.uploadMealPhoto = (req, res, next) => {
  uploadMealPhoto(req, res, (err) => {
    if (err) {
      return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
    }

    // If no file was uploaded, just continue
    if (!req.file) {
      return next();
    }

    // Add the file path to the request body
    req.body.photo = req.file.path;
    next();
  });
};
