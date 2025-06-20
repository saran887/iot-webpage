import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setSelectedStatus('');
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${selectedOrder._id}/status`,
        { status: selectedStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchOrders();
      setSuccess('Order status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      handleCloseDetails();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Orders
      </Typography>

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.user?.name || 'N/A'}</TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'inline-block', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    bgcolor: `${getStatusColor(order.status)}.light`,
                    color: `${getStatusColor(order.status)}.dark`
                  }}>
                    {order.status.toUpperCase()}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Order #{selectedOrder._id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {selectedOrder.user?.name || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Items:
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.product?.name || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ₹{selectedOrder.total}
              </Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Shipping Address:
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shippingAddress.street}<br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                {selectedOrder.shippingAddress.zipCode}<br />
                {selectedOrder.shippingAddress.country}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Cancel</Button>
              <Button 
                onClick={handleUpdateStatus}
                variant="contained"
                color="primary"
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Orders; 