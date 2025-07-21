import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Alert, Box } from '@mui/material';
import axios from 'axios';

const OTP_TIMEOUT = 60; // seconds

const ConfirmOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';
  const [inputEmail, setInputEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendError, setResendError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(OTP_TIMEOUT);
  const timerRef = useRef();

  useEffect(() => {
    setTimer(OTP_TIMEOUT);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [inputEmail, resendMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (timer === 0) {
      setError('OTP expired. Please resend OTP.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email: inputEmail, otp });
      setSuccess('Email verified successfully! You can now login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  const handleResendOtp = async () => {
    setResendMsg('');
    setResendError('');
    setIsResending(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password-email', { email: inputEmail });
      setResendMsg('OTP resent to your email.');
      setTimer(OTP_TIMEOUT);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to resend OTP');
    }
    setIsResending(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Confirm OTP
        </Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          Please enter the OTP sent to your email.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {resendMsg && <Alert severity="success" sx={{ mb: 2 }}>{resendMsg}</Alert>}
        {resendError && <Alert severity="error" sx={{ mb: 2 }}>{resendError}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          {!inputEmail && (
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              margin="normal"
              required
            />
          )}
          <TextField
            fullWidth
            label="OTP"
            name="otp"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            margin="normal"
            required
            disabled={timer === 0}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handleResendOtp}
              disabled={isResending || !inputEmail || timer > 0}
            >
              {isResending ? 'Resending...' : 'Resend OTP'}
            </Button>
            <Typography sx={{ ml: 2 }} color={timer === 0 ? 'error' : 'text.secondary'}>
              {timer > 0 ? `Resend OTP in ${timer}s` : 'OTP expired'}
            </Typography>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={!inputEmail || timer === 0}
          >
            Verify OTP
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConfirmOtp; 