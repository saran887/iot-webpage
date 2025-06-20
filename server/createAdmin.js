const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/iot-webpage', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  try {
    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@iot.com' });
    console.log('Admin user removed from database.');
  } catch (err) {
    console.error('Error removing admin:', err);
  } finally {
    process.exit(0);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 