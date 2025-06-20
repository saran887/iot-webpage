import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to IoT Components Store
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Your one-stop shop for all IoT components and accessories
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/products"
          sx={{ mr: 2 }}
        >
          Browse Products
        </Button>
        
      </Box>
    </Container>
  );
};

export default Home; 