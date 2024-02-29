import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import DriverList from './DriverList';
import Cookies from 'js-cookie';

const Driver = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const schoolId = Cookies.get('schoolId');

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/driver/getAllDriversofSchool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schoolId, token }),
      });
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  }, [schoolId, token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleAdd = () => {
    navigate('/add-driver');
  };

  const handleEdit = (driverId) => {
    // Logic to handle edit action
    navigate(`/edit-driver/${driverId}`);
  };

  const handleDetails = (driverId) => {
    // Logic to handle details action
    navigate(`/driver-details/${driverId}`);
  };

  const handleAssign = (driverId) => {  
    // Logic to handle assign action
    navigate(`/assign-students/${driverId}`);
  };


  const handleDelete = async (driverId) => {
    try {
      const response = await fetch('http://localhost:3000/driver', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId, schoolId }),
      });
      if (response.ok) {
        fetchDrivers(); // Refresh the drivers list after deletion
        alert('Driver deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete driver');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };

  useEffect(() => {
    // Filter drivers based on the search term
    if(drivers.length > 0) {
    const filtered = drivers.filter(driver =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setFilteredDrivers(filtered);
    }
  }, [drivers, searchTerm]);


  return (
    <div>
      <Form.Control
    type="text"
    placeholder="Search driver by any credential"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      width: '80%',
      display: 'block',
      margin: '0 auto',
      position: 'sticky',
      top: 70,
      zIndex: 1000,
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 0 10px 3px rgba(0,0,0,0.2)',
      backgroundColor: '#f5f5f5',
      marginBottom: '80px',
    }}
  />
      <Button variant="primary" onClick={handleAdd} style={{ marginBottom: '20px' }}>
        Add New Driver
      </Button>
      <DriverList drivers={filteredDrivers} handleEdit={handleEdit} handleDelete={handleDelete} handleDetails={handleDetails} handleAssign={handleAssign} />
    </div>
  );
};

export default Driver;
