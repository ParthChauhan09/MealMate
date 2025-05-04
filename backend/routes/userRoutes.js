const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const { roles } = require("../config/config");

// Admin only routes
router.get("/", protect, authorize(roles.ADMIN), userController.getAllUsers);

// Protected routes
router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;
