import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Card, CardContent, Avatar, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem('role') === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      fetchUserData();
      fetchAddress();
    }
    // eslint-disable-next-line
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Get user data from localStorage or make an API call
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name && user.email) {
        setUserData({ name: user.name, email: user.email });
      }
    } catch (err) {
      setError('Failed to load user data');
    }
  };

  const fetchAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.address) {
        setAddress(res.data.address);
        setShowProfile(
          !!(res.data.address.street && res.data.address.city && res.data.address.state && res.data.address.zipCode && res.data.address.country)
        );
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load address');
      }
    }
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const res = await axios.put('http://localhost:5000/api/auth/profile/address', address, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Address saved successfully!');
      setError('');
      setShowProfile(true);
      setShowAddressForm(false);
      setAddress(res.data.address);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to save address');
        setSuccess('');
      }
    }
  };

  const handleEditAddress = () => {
    setShowAddressForm(true);
    setSuccess('');
    setError('');
  };

  if (isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Profile</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>You are logged in as an admin.</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>Go to Home Page</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      
      {showProfile && (
        <Card sx={{ mb: 4, maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6">{userData.name || 'User'}</Typography>
                <Typography variant="body2" color="text.secondary">{userData.email || 'user@example.com'}</Typography>
              </Box>
            </Box>
            <Typography variant="h6" gutterBottom>Address Details</Typography>
            <Typography><b>Street:</b> {address.street}</Typography>
            <Typography><b>City:</b> {address.city}</Typography>
            <Typography><b>State:</b> {address.state}</Typography>
            <Typography><b>ZIP Code:</b> {address.zipCode}</Typography>
            <Typography><b>Country:</b> {address.country}</Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Settings</Typography>
          </Box>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Update Address</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {showAddressForm ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Street"
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, mr: 1 }}>
                    Save Address
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowAddressForm(false)}
                    sx={{ mt: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Update your shipping address information
                  </Typography>
                  <Button variant="outlined" onClick={handleEditAddress}>
                    Edit Address
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Account Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Account settings options will be available here
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Privacy Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Privacy and security settings will be available here
              </Typography>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {success && <Typography color="success.main" sx={{ mt: 2, textAlign: 'center' }}>{success}</Typography>}
      {error && <Typography color="error.main" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
    </Container>
  );
};

export default Profile; 