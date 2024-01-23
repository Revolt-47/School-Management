import React, { useState } from 'react';
import { Button, Dialog, DialogContent, Paper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from './AdminAssets/logo.jpeg';
import './css/login.css';

const SuperAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleForgetPassword = async () => {
    try {
      // Make a POST request to the forget password endpoint
      const response = await fetch('http://localhost:3000/superadmin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForReset }),
      });

      if (response.ok) {
        // Display success toast
        toast.success('Password reset email sent. Please check your email.');
        handleCloseModal();
      } else {
        // Display error toast
        toast.error('Unable to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error during forget password:', error);
      // Display error toast
      toast.error('An unexpected error occurred.');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Accessing form values directly
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Make a POST request to the login endpoint
      const response = await fetch('http://localhost:3000/superadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Set the token in a cookie (You may need to install a cookie library)
        document.cookie = `token=${data.token}; path=/`;

        // Display success toast
        toast.success('Login successful');

        // Navigate to the SuperAdminHomePage
        navigate('/superadmin/home');
      } else {
        // Display error toast
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Display error toast
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='root'>
      <div className='left'>
        <Paper elevation={3} className='form-container'>
          <Typography variant="h5" align="center" gutterBottom>
            Login as SuperAdmin
          </Typography>
          <div>
            <TextField
              label="Email"
              type="email"
              id="email"
              name="email"
              variant="outlined"
              margin="normal"
              fullWidth
              required
            />
          </div>
          <div>
            <TextField
              label="Password"
              type="password"
              id="password"
              name="password"
              variant="outlined"
              margin="normal"
              fullWidth
              required
            />
          </div>
          <div className="center-button">
            <Button
              variant="contained"
              color="primary"
              style={{ background: 'black', color: 'white' }}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
          <div className="center-button">
            <Typography
              variant="body2"
              color="primary"
              style={{ cursor: 'pointer' }}
              onClick={handleOpenModal}
            >
              Forget Password?
            </Typography>
          </div>
        </Paper>
      </div>
      <div className='right'>
        <img src={logo} alt="Logo" />
      </div>

      {/* Forget Password Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogContent>
          <Typography variant="h5" align="center" gutterBottom>
            Forget Password
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
            Enter your email
          </Typography>
          <div>
            <TextField
              label="Email"
              type="email"
              id="emailForReset"
              name="emailForReset"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              onChange={(e) => setEmailForReset(e.target.value)}
            />
          </div>
          <div className="center-button">
            <Button
              variant="contained"
              color="primary"
              style={{ background: 'black', color: 'white' }}
              onClick={handleForgetPassword}
            >
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default SuperAdminLogin;
