const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config/config');

const OrderSchema = new Schema(
  {
    meal: {
      type: mongoose.Schema.ObjectId,
      ref: 'Meal',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(config.orderStatus),
      default: config.orderStatus.PENDING
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
      min: [1, 'Quantity must be at least 1']
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Please add a delivery address']
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Please add a delivery date']
    },
    specialInstructions: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Order', OrderSchema);
