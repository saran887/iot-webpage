const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 0
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a method to calculate total
cartSchema.methods.calculateTotal = async function() {
  await this.populate('items.product');
  return this.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Add a method to validate stock
cartSchema.methods.validateStock = async function() {
  await this.populate('items.product');
  for (const item of this.items) {
    if (!item.product) {
      throw new Error('Product not found');
    }
    if (item.quantity > item.product.stock) {
      throw new Error(`Not enough stock for ${item.product.name}`);
    }
  }
  return true;
};

// Pre-save middleware to validate stock
// cartSchema.pre('save', async function(next) {
//   try {
//     console.log('Cart pre-save middleware called');
//     // Only validate stock if items exist
//     if (this.items && this.items.length > 0) {
//       console.log('Validating stock for', this.items.length, 'items');
//       await this.validateStock();
//     }
//     next();
//   } catch (error) {
//     console.error('Cart pre-save middleware error:', error);
//     next(error);
//   }
// });

module.exports = mongoose.model('Cart', cartSchema); 