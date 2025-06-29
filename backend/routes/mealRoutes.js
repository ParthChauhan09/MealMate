const express = require("express");
const router = express.Router();
const mealController = require("../controllers/mealController");
const { protect, authorize } = require("../middleware/auth");
const { uploadMealPhoto } = require("../middleware/fileUpload");
const { roles } = require("../config/config");
const reviewRouter = require("./reviewRoutes");

// Re-route into review router
router.use("/:mealId/reviews", reviewRouter);

// Public routes
router.get("/", mealController.getAllMeals);
router.get("/:id", mealController.getMealById);

// Provider only routes
router.post(
  "/",
  protect,
  authorize(roles.PROVIDER),
  uploadMealPhoto,
  mealController.createMeal
);
router.put(
  "/:id",
  protect,
  authorize(roles.PROVIDER),
  uploadMealPhoto,
  mealController.updateMeal
);
router.delete(
  "/:id",
  protect,
  authorize(roles.PROVIDER),
  mealController.deleteMeal
);

// Meal photo upload route
router.put(
  "/:id/photo",
  protect,
  authorize(roles.PROVIDER),
  uploadMealPhoto,
  mealController.uploadMealPhoto
);

module.exports = router;
