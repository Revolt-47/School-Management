import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Paper } from '@mui/material';
import logo from './AdminAssets/logo.jpeg';
import school from './AdminAssets/school.png';
import { useNavigate } from 'react-router-dom';

const SuperAdminHomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Delete the token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Navigate back to login
    navigate('/');
  };

  const handleCardClick = () => {
    // Navigate to AllSchoolsScreen
    navigate('/superadmin/allschools');
  };

  return (
    <div>
      {/* Title Bar */}
      <AppBar position="static" style={{ backgroundColor: '#000000' }}>
        <Toolbar style={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
          />
          {/* SuperAdmin Text */}
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            SuperAdmin
          </Typography>
          {/* Logout Button with Material Icons */}
          <Button color="warning" style={{ backgroundColor: 'red'}} onClick={handleLogout}>
            <span className="material-icons" style={{ color: 'white' }}>
              Logout
            </span>
          </Button>
        </Toolbar>
      </AppBar>

      {/* Body with Tiles */}
      <Container sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          {/* Example Tile: Schools */}
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              onClick={handleCardClick}
            >
              <img src={school} width={80} height={50} alt="School Icon" />
              {/* Tile Title */}
              <Typography variant="h6" sx={{ marginTop: 1 }}>
                Schools
              </Typography>
            </Paper>
          </Grid>
          {/* Add more tiles as needed */}
        </Grid>
      </Container>
    </div>
  );
};

export default SuperAdminHomePage;
