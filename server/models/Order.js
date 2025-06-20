const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a method to calculate total
orderSchema.methods.calculateTotal = function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Pre-save middleware to validate total
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('total')) {
    const calculatedTotal = this.calculateTotal();
    if (this.total !== calculatedTotal) {
      this.total = calculatedTotal;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema); 