const express = require("express");
const router = express.Router();
const mealController = require("../controllers/mealController");
const { protect, authorize } = require("../middleware/auth");
const { roles } = require("../config/config");
const reviewRouter = require("./reviewRoutes");
const multer = require('multer');
const upload = multer();

// Re-route into review router
router.use("/:mealId/reviews", reviewRouter);

// Public routes
router.get("/", mealController.getAllMeals);
router.get("/:id", mealController.getMealById);

// Provider only routes
router.post(
  "/",
  // Do NOT use upload.single('mealPhoto') here, it's in the controller
  mealController.createMeal
);
router.put(
  "/:id",
  protect,
  authorize(roles.PROVIDER),
  mealController.updateMeal
);
router.delete(
  "/:id",
  protect,
  authorize(roles.PROVIDER),
  mealController.deleteMeal
);

// Simple test upload route for debugging file upload issues
router.post('/test-upload', upload.single('testFile'), (req, res) => {
  res.json({ file: req.file, body: req.body });
});

// Test router-level upload
router.post('/test-router', upload.single('testFile'), (req, res) => {
  res.json({ file: req.file, body: req.body });
});

module.exports = router;
