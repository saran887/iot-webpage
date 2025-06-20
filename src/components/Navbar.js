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
  const isAuthenticated = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        const count = response.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(count);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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