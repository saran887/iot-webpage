import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [role, setRole] = useState(localStorage.getItem('role'));
  const isAdmin = role === 'admin';
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItemCount(0);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        const count = response.data.reduce((sum, item) => {
          // Check if item and item.quantity exist
          return sum + (item && item.quantity ? item.quantity : 0);
        }, 0);
        setCartItemCount(count);
      } else {
        setCartItemCount(0);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
      setCartItemCount(0);
      if (err.response?.status === 401) {
        // Token expired or invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setRole(null);
      }
    }
  };

  // Refresh cart count when component mounts or when navigating
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated, isAdmin]);

  // Listen for cart updates (you can trigger this from other components)
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isAuthenticated && !isAdmin) {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isAuthenticated, isAdmin]);

  // Listen for login/logout and update role state
  useEffect(() => {
    const onStorage = () => setRole(localStorage.getItem('role'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          IoT Components Store
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/products"
          >
            Products
          </Button>

          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/cart"
              >
                <Badge badgeContent={cartItemCount} color="secondary">
                  <CartIcon />
                </Badge>
              </IconButton>

              <Button
                color="inherit"
                component={RouterLink}
                to="/orders"
              >
                Orders
              </Button>

              {isAdmin && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin"
                >
                  Admin Dashboard
                </Button>
              )}

              <Button
                color="inherit"
                component={RouterLink}
                to="/profile"
                startIcon={<PersonIcon />}
              >
                Profile
              </Button>

              <Button
                color="inherit"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<PersonIcon />}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 