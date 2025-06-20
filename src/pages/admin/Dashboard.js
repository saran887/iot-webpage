import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography paragraph>
        Welcome, Admin! Use the navigation to manage products and orders.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/admin/products"
          sx={{ mr: 2 }}
        >
          Manage Products
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/admin/orders"
        >
          Manage Orders
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard; 