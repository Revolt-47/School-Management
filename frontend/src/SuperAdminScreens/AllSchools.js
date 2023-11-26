import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  IconButton,
  Menu,
  CircularProgress,
} from '@mui/material';
import { Search, ArrowBack, FilterList, CheckCircle, Info, Block, Warning } from '@mui/icons-material';
import logo from './AdminAssets/logo.jpeg';
import { useNavigate } from 'react-router-dom';

const AllSchoolsScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [schools, setSchools] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
  
        const response = await fetch('http://localhost:3000/schools/getallschools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
  
        if (response.ok) {
          const data = await response.json();
          // Check if the data object has an array property
          if (Array.isArray(data.schools)) {
            setSchools(data.schools);
          } else {
            setError('Invalid response format: Missing or invalid "schools" property');
          }
        } else {
          setError('Error fetching schools');
        }
      } catch (error) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchSchools();
  }, []);
  

  const filteredSchools = schools
    ? schools.filter(
        (school) =>
          school.branchName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (filterStatus === '' || school.status === filterStatus)
      )
    : [];

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (status) => {
    setFilterStatus(status);
    setAnchorEl(null);
  };

  const handleSchoolClick = (school) => {
    // Navigate to SchoolDetailsScreen with the school data as props
    history({
      pathname: `/superadmin/schooldetails/${school._id}`,
      state: { schoolData: school },
    });
  };

  return (
    <div>
      {/* App Bar */}
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
            All Schools
          </Typography>
          {/* Back Button */}
          <Button color="warning" style={{ backgroundColor: 'red' }} onClick={()=>(history('/superadmin/home'))}>
            <ArrowBack style={{ color: 'white' }} />
          </Button>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Container sx={{ marginTop: 2, backgroundColor: 'white', padding: '10px', textAlign: 'center' }}>
        {/* Search Bar */}
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: '60%', margin: 'auto' }}
        />
        {/* Filter Icon */}
        <IconButton onClick={handleFilterClick}>
          <FilterList />
        </IconButton>
        {/* Filter Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => handleFilterClose('')}>All</MenuItem>
          <MenuItem onClick={() => handleFilterClose('verified')}>Verified</MenuItem>
          <MenuItem onClick={() => handleFilterClose('active')}>Active</MenuItem>
          <MenuItem onClick={() => handleFilterClose('inactive')}>Inactive</MenuItem>
          <MenuItem onClick={() => handleFilterClose('blocked')}>Blocked</MenuItem>
        </Menu>

        {/* Divider */}
        <Divider sx={{ marginY: 2 }} />

        {/* Display Schools */}
        {loading && <CircularProgress sx={{ margin: '20px' }} />}
        {error && <Typography>Error: {error}</Typography>}
        {!loading &&
          !error &&
          filteredSchools.map((school, index) => (
            <Paper
              key={index}
              sx={{ p: 2, marginBottom: 2, backgroundColor: '#f5f5f5', cursor: 'pointer' }}
              onClick={() => handleSchoolClick(school)}
            >
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Typography variant="h6">{school.branchName}</Typography>
                  <Typography variant="body1" component="span">
                    {school.status === 'verified' && (
                      <>
                        <CheckCircle style={{ color: 'green', marginRight: '5px' }} />
                        Verified
                      </>
                    )}
                    {school.status === 'active' && (
                      <>
                        <Info style={{ color: 'blue', marginRight: '5px' }} />
                        Active
                      </>
                    )}
                    {school.status === 'inactive' && (
                      <>
                        <Warning style={{ color: 'orange', marginRight: '5px' }} />
                        Inactive
                      </>
                    )}
                    {school.status === 'blocked' && (
                      <>
                        <Block style={{ color: 'red', marginRight: '5px' }} />
                        Blocked
                      </>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
      </Container>
    </div>
  );
};

export default AllSchoolsScreen;
