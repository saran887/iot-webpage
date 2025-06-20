const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Motors',
      'Soldering Items',
      'Basic Tools',
      'Wheels',
      'Temperature Controller',
      'Batteries',
      'Battery Holders',
      'Chargers',
      'Adaptors',
      'Sensor Modules',
      'Sensors Only',
      'Motor Driver',
      'Board',
      'Other Modules'
    ]
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 