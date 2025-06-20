import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

const categories = [
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
];

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const url = selectedCategory
        ? `http://localhost:5000/api/products?category=${selectedCategory}`
        : 'http://localhost:5000/api/products';
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId, quantity: 1 },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setSuccess('Product added to cart successfully!');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.response?.data?.message || 'Failed to add product to cart');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={success || error}
      />
      
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={(() => {
                  try {
                    // If it's a Google Images URL, try to extract the actual image URL
                    if (product.image.includes('imgurl=')) {
                      const imgUrl = decodeURIComponent(product.image.split('imgurl=')[1].split('&')[0]);
                      return imgUrl;
                    }
                    return product.image;
                  } catch (err) {
                    console.error('Error processing image URL:', err);
                    return '/placeholder.png';
                  }
                })()}
                alt={product.name}
                sx={{
                  objectFit: 'contain',
                  backgroundColor: '#f5f5f5'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', product.image);
                  e.target.onerror = null;
                  e.target.src = '/placeholder.png';
                }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock: {product.stock}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList; 