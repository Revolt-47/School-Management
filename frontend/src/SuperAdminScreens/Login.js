import React, { useState } from 'react';
import { Button, Paper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/login.css';
import logo from './AdminAssets/logo.jpeg';

const SuperAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      setLoading(true);

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
          <form onSubmit={handleSubmit}>
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
                type="submit"
                variant="contained"
                color="primary"
                style={{ background: 'black', color: 'white' }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </Paper>
      </div>
      <div className='right'>
        <img src={logo} alt="Logo" />
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default SuperAdminLogin;
