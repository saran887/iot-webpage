const mongoose = require('mongoose');
const Product = require('./models/Product');

// Set this to the default image URL you want to use
const DEFAULT_IMAGE_URL = 'https://example.com/default-product-image.jpg';

async function migrateImagesToUrl() {
  await mongoose.connect('mongodb://127.0.0.1:27017/iot-webpage', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Find all products where image does NOT start with http
  const products = await Product.find({ image: { $not: /^http/ } });
  console.log(`Found ${products.length} products with local image paths.`);
  for (const product of products) {
    try {
      // Set the image to the default URL (or you can customize per product)
      product.image = DEFAULT_IMAGE_URL;
      await product.save();
      console.log(`Updated product ${product._id} to use image URL.`);
    } catch (err) {
      console.error(`Failed to update product ${product._id}:`, err.message);
    }
  }
  await mongoose.disconnect();
  console.log('Migration to image URLs complete.');
}

migrateImagesToUrl(); 