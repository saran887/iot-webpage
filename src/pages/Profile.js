import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Card, CardContent, Avatar, Accordion, AccordionSummary, AccordionDetails, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

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
    email: '',
    mobile: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: enter mobile, 2: enter OTP+new pass
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isAdmin = localStorage.getItem('role') === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      fetchUserData();
      fetchAddress();
      // Fetch all states from backend
      axios.get('http://localhost:5000/api/locations/states')
        .then(res => setStates(res.data))
        .catch(() => setStates([]));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (address.state) {
      axios.get(`http://localhost:5000/api/locations/districts?state=${encodeURIComponent(address.state)}`)
        .then(res => setDistricts(res.data))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
  }, [address.state]);

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
        setUserData({ name: user.name, email: user.email, mobile: user.mobile || '' });
      }
      // Optionally fetch from backend for latest mobile
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.mobile) {
        setUserData(prev => ({ ...prev, mobile: res.data.mobile }));
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

  const handleMobileChange = (e) => {
    const value = e.target.value;
    setMobile(value);
    if (!/^[6-9]\d{9}$/.test(value)) {
      setMobileError('Mobile number must be 10 digits and start with 6, 7, 8, or 9');
    } else {
      setMobileError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError('Mobile number must be 10 digits and start with 6, 7, 8, or 9');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.put('http://localhost:5000/api/auth/profile/address', {
        ...address,
        mobile
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully!');
      setError('');
      setShowProfile(true);
      setShowAddressForm(false);
      setAddress(res.data.address);
      setUserData(prev => ({ ...prev, mobile }));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to update profile');
        setSuccess('');
      }
    }
  };

  const handleEditAddress = () => {
    setShowAddressForm(true);
    setSuccess('');
    setError('');
  };

  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password-sms', { mobile: forgotMobile });
      setForgotMsg('OTP sent to your mobile number.');
      setForgotStep(2);
      setSnackbarOpen(true);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP');
      setSnackbarOpen(true);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password-sms', {
        mobile: forgotMobile,
        otp: forgotOtp,
        newPassword: forgotNewPass
      });
      setForgotMsg('Password reset successful!');
      setForgotStep(1);
      setForgotMobile('');
      setForgotOtp('');
      setForgotNewPass('');
      setSnackbarOpen(true);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password');
      setSnackbarOpen(true);
    }
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
                <Typography variant="body2" color="text.secondary">{userData.mobile ? `Mobile: ${userData.mobile}` : ''}</Typography>
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
                    label="Mobile Number"
                    name="mobile"
                    value={mobile}
                    onChange={handleMobileChange}
                    margin="normal"
                    required
                    inputProps={{ maxLength: 10 }}
                    helperText={mobileError || 'Enter 10 digit mobile number'}
                    error={!!mobileError}
                  />
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>State</InputLabel>
                    <Select
                      name="state"
                      value={address.state}
                      label="State"
                      onChange={handleChange}
                    >
                      {states.map((state) => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>City/District</InputLabel>
                    <Select
                      name="city"
                      value={address.city}
                      label="City/District"
                      onChange={handleChange}
                      disabled={!address.state}
                    >
                      {districts.map((district) => (
                        <MenuItem key={district} value={district}>{district}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Forgot Password (via OTP)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {forgotStep === 1 ? (
                <Box component="form" onSubmit={handleForgotSendOtp}>
                  <TextField
                    fullWidth
                    label="Registered Mobile Number"
                    name="forgotMobile"
                    value={forgotMobile}
                    onChange={e => setForgotMobile(e.target.value)}
                    margin="normal"
                    required
                    inputProps={{ maxLength: 10 }}
                    helperText="Enter your registered 10 digit mobile number"
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    Send OTP
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleForgotReset}>
                  <TextField
                    fullWidth
                    label="OTP"
                    name="forgotOtp"
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    name="forgotNewPass"
                    type="password"
                    value={forgotNewPass}
                    onChange={e => setForgotNewPass(e.target.value)}
                    margin="normal"
                    required
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, mr: 1 }}>
                    Reset Password
                  </Button>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setForgotStep(1)}>
                    Cancel
                  </Button>
                </Box>
              )}
              {forgotMsg && <Alert severity="success" sx={{ mt: 2 }}>{forgotMsg}</Alert>}
              {forgotError && <Alert severity="error" sx={{ mt: 2 }}>{forgotError}</Alert>}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {success && <Typography color="success.main" sx={{ mt: 2, textAlign: 'center' }}>{success}</Typography>}
      {error && <Typography color="error.main" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={forgotMsg || forgotError}
      />
    </Container>
  );
};

export default Profile; 