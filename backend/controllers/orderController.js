const Order = require("../models/Order");
const Meal = require("../models/meal");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const config = require("../config/config");

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  // For regular users, only show their orders
  if (req.user.role === config.roles.CUSTOMER) {
    const orders = await Order.find({ user: req.user.id })
      .populate("meal", "name price description")
      .populate("provider", "name");

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }

  // For providers, show orders for their meals
  if (req.user.role === config.roles.PROVIDER) {
    const orders = await Order.find({ provider: req.user.id })
      .populate("meal", "name price description")
      .populate("user", "name email");

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }

  // For admins, show all orders
  const orders = await Order.find()
    .populate("meal", "name price description")
    .populate("user", "name email")
    .populate("provider", "name");

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("meal", "name price description")
    .populate("user", "name email")
    .populate("provider", "name");

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is order owner, provider, or admin
  if (
    order.user.toString() !== req.user.id &&
    order.provider.toString() !== req.user.id &&
    req.user.role !== config.roles.ADMIN
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this order`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check if meal exists
  const meal = await Meal.findById(req.body.meal);

  if (!meal) {
    return next(
      new ErrorResponse(`Meal not found with id of ${req.body.meal}`, 404)
    );
  }

  // Add provider to req.body
  req.body.provider = meal.user;

  // Set initial status
  req.body.status = config.orderStatus.PENDING;

  const order = await Order.create(req.body);

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is order provider or admin
  if (
    order.provider.toString() !== req.user.id &&
    req.user.role !== config.roles.ADMIN
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this order`,
        401
      )
    );
  }

  // Validate status
  if (!Object.values(config.orderStatus).includes(req.body.status)) {
    return next(
      new ErrorResponse(`Invalid status value: ${req.body.status}`, 400)
    );
  }

  // Update status
  order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is order owner, provider, or admin
  if (
    order.user.toString() !== req.user.id &&
    order.provider.toString() !== req.user.id &&
    req.user.role !== config.roles.ADMIN
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to cancel this order`,
        401
      )
    );
  }

  // Only allow cancellation if order is pending or confirmed
  if (
    order.status !== config.orderStatus.PENDING &&
    order.status !== config.orderStatus.CONFIRMED
  ) {
    return next(
      new ErrorResponse(
        `Order cannot be canceled in ${order.status} status`,
        400
      )
    );
  }

  // Update status to cancelled
  await Order.findByIdAndUpdate(
    req.params.id,
    { status: config.orderStatus.CANCELLED },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});
