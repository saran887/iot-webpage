const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with environment variable in production
    
    // Get the user from the database to ensure we have the latest role
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user info to request with role
    req.user = {
      id: user._id,
      role: user.role || 'user' // Default to 'user' if role is not set
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Authentication required' });
  }
}; 