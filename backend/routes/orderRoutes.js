const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");
const { roles } = require("../config/config");

// All order routes require authentication
router.use(protect);

// Routes for all authenticated users
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);

// Customer only routes
router.post("/", authorize(roles.CUSTOMER), orderController.createOrder);

// Routes for all authenticated users
router.put("/:id", orderController.updateOrderStatus);
router.delete("/:id", orderController.cancelOrder);

module.exports = router;
