import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@mui/material';
import {
  ArrowBack,
  Info,
  Warning,
  Block,
  CheckCircle,
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from './AdminAssets/logo.jpeg';
import { useParams,useNavigate } from 'react-router-dom';

const SchoolDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [schoolData, setSchoolData] = useState(null);
  const [schoolStatus, setSchoolStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusChanged, setStatusChanged] = useState(false);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          .split('=')[1];

        const response = await fetch(
          `http://localhost:3000/schools/getschool/${id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
          }
        );

        if (response.status === 404) {
          setNotFound(true);
          setErrorMessage('School not found');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSchoolData(data.school);
        setSchoolStatus(data.school.status);
      } catch (error) {
        console.error('Error fetching school details:', error);
        toast.error('Failed to fetch school details.');
        setErrorMessage('Error fetching school details');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, [id]);

  useEffect(() => {
    if (statusChanged) {
      setOpenDialog(true);
      setStatusChanged(false);
    }
  }, [statusChanged]);

  const handleStatusChange = () => {
    setStatusChanged(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChangeStatus = (event) => {
    setSchoolStatus(event.target.value);
    setStatusChanged(!statusChanged);
  };

  const handleConfirmStatusChange = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        .split('=')[1];

      const response = await fetch(
        `http://localhost:3000/schools/changestatus`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            schoolId: id,
            newStatus: schoolStatus,
            token,
          }),
        }
      );

      if (response.ok) {
        setSchoolStatus(schoolStatus);
        toast.success('Status changed successfully!');
      } else {
        toast.error('Failed to change school status.');
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error changing school status:', error);
      toast.error('Failed to change school status.');
    }
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
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              marginRight: '10px',
            }}
          />
          {/* School Name or Error Message */}
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            {notFound ? errorMessage : schoolData?.branchName}
          </Typography>
          {/* Back Button */}
          <Button color="warning" style={{ backgroundColor: 'red' }} onClick={()=>navigate('/superadmin/allschools')}>
            <ArrowBack style={{ color: 'white' }} />
          </Button>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Container sx={{ marginTop: 2, padding: '10px' }}>
        <Grid container spacing={2}>
          {/* General Details */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">General Details</Typography>
                <Typography variant="body1">
                  {schoolData?.address}, {schoolData?.city}
                </Typography>
                <Typography variant="body1">{schoolData?.email}</Typography>
                <Typography variant="body1">
                  Number of Gates: {schoolData?.numberOfGates}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Timings */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Timings</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Open Time</TableCell>
                        <TableCell>Close Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schoolData?.timings.map((timing, index) => (
                        <TableRow key={index}>
                          <TableCell>{timing.day}</TableCell>
                          <TableCell>
                            {new Date(timing.openTime).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            {new Date(timing.closeTime).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Status</Typography>
                <Select
                  value={schoolStatus}
                  onChange={handleChangeStatus}
                  fullWidth
                >
                  <MenuItem value="active">
                    <CheckCircle style={{ color: 'green', marginRight: '5px' }} />
                    Active
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Warning style={{ color: 'orange', marginRight: '5px' }} />
                    Inactive
                  </MenuItem>
                  <MenuItem value="blocked">
                    <Block style={{ color: 'red', marginRight: '5px' }} />
                    Blocked
                  </MenuItem>
                </Select>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Status Change Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change School Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of the school?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmStatusChange} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default SchoolDetailsScreen;
