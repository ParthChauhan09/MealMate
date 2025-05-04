const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");
const { roles } = require("../config/config");

// Public routes
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReview);

// Protected routes
router.post(
  "/",
  protect,
  authorize(roles.CUSTOMER),
  reviewController.addReview
);
router.put("/:id", protect, reviewController.updateReview);
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
