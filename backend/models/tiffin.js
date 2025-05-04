const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MealMate Schema
const tiffinSchema = new Schema({
    id: {
        type: String,
        required: false,
      },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage'],
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Tiffin', tiffinSchema);