import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Box,
  Alert,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userAddress, setUserAddress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchUserAddress();
  }, [navigate]);

  const fetchUserAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.address) {
        const address = response.data.address;
        // Check if address is complete
        if (address.street && address.city && address.state && address.zipCode && address.country) {
          setUserAddress(address);
        }
      }
    } catch (err) {
      console.error('Error fetching user address:', err);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Ensure we have a valid cart structure
      if (response.data) {
        setCart({ items: Array.isArray(response.data) ? response.data : [] });
      } else {
        setCart({ items: [] });
      }
      
      // Trigger cart count update in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Error fetching cart. Please try again.');
      }
      setCart({ items: [] });
      // Trigger cart count update in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Find the cart item that matches the product ID
      const cartItem = cart.items.find(item => item.product._id === productId);
      if (!cartItem) {
        setError('Item not found in cart');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/cart/${cartItem._id}`,
        { quantity: newQuantity },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchCart();
    } catch (err) {
      console.error('Error updating cart:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Error updating cart. Please try again.');
      }
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Find the cart item that matches the product ID
      const cartItem = cart.items.find(item => item.product._id === productId);
      if (!cartItem) {
        setError('Item not found in cart');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/cart/${cartItem._id}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchCart();
      setSuccess('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Error removing item. Please try again.');
      }
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Check if user has a complete address
      if (!userAddress) {
        setError('Please complete your address in your profile before placing an order.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        { shippingAddress: userAddress },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setSuccess('Order placed successfully!');
        setCart({ items: [] });
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (err.response.status) {
          case 401:
            localStorage.removeItem('token');
            navigate('/login');
            break;
          case 400:
            setError(err.response.data.message || 'Invalid request. Please check your input.');
            break;
          case 403:
            setError('You do not have permission to perform this action.');
            break;
          case 404:
            setError('The requested resource was not found.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An error occurred. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error setting up the request. Please try again.');
      }
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      if (!item.product) return total;
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>
        <Typography>Your cart is empty</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            item.product ? (
              <Card key={item._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <img 
                        src={(() => {
                          try {
                            // If it's a Google Images URL, try to extract the actual image URL
                            if (item.product.image.includes('imgurl=')) {
                              const imgUrl = decodeURIComponent(item.product.image.split('imgurl=')[1].split('&')[0]);
                              return imgUrl;
                            }
                            return item.product.image;
                          } catch (err) {
                            console.error('Error processing image URL:', err);
                            return '/placeholder.png';
                          }
                        })()}
                        alt={item.product.name}
                        style={{ 
                          width: '100%', 
                          maxWidth: '150px', 
                          objectFit: 'contain',
                          minHeight: '150px'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', item.product.image);
                          e.target.onerror = null;
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6">{item.product.name}</Typography>
                      <Typography>₹{item.product.price}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton 
                        color="error"
                        onClick={() => handleRemoveItem(item.product._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : null
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              {userAddress ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {userAddress.street}<br />
                    {userAddress.city}, {userAddress.state} {userAddress.zipCode}<br />
                    {userAddress.country}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="error">
                    Please complete your address in your profile
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate('/profile')}
                    sx={{ mt: 1 }}
                  >
                    Go to Profile
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Typography>
                  Total Items: {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total: ₹{calculateTotal().toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handlePlaceOrder}
                  disabled={!userAddress}
                >
                  Place Order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart; 