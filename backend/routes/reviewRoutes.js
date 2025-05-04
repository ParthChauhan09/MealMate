const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");
const { uploadReviewPhotos } = require("../middleware/fileUpload");
const { roles } = require("../config/config");

// Public routes
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReview);

// Protected routes
router.post(
  "/",
  protect,
  authorize(roles.CUSTOMER),
  uploadReviewPhotos,
  reviewController.addReview
);
router.put("/:id", protect, uploadReviewPhotos, reviewController.updateReview);
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
