const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price image')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order (requires only authentication, no admin access needed)
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ 
          message: 'One or more products in your cart are no longer available'
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock available for ${product.name}`
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    // Calculate total price
    const totalPrice = orderItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      total: totalPrice,
      status: 'pending',
      shippingAddress
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();
    await order.save();

    // Populate order details before sending response
    await order.populate('items.product', 'name price image');

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/all', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 