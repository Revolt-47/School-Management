import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import DriverList from './DriverList';
import Cookies from 'js-cookie';
import { Container, Row, Col } from 'react-bootstrap';

const Driver = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const school = JSON.parse(Cookies.get('school'));
  const schoolId = school._id;

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
    if (window.confirm('Are you sure you want to delete this driver?')) {
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
    <Container className="mt-5" style={{ height: '100vh', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '3em', fontWeight: 'bold', color: '#333' }}>Driver Management Module</h1>
        <p style={{ fontSize: '1.2em', color: '#666' }}>Easily manage your drivers</p>
      </div>
      <Form.Control
        type="text"
        placeholder="Search driver by any credential"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '50%',
          display: 'block',
          margin: '0 auto',
          position: 'sticky',
          top: 90,
          zIndex: 1000,
          border: 'none',
          borderRadius: '15px',
          boxShadow: '0 0 10px 3px rgba(0,0,0,0.2)',
          backgroundColor: '#f5f5f5',
        }}
      />
      <Row style={{ marginTop: "60px" }}>
        <Col>
          <Button variant="primary" onClick={handleAdd}>
            Add New Driver
          </Button>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <DriverList drivers={filteredDrivers} handleEdit={handleEdit} handleDelete={handleDelete} handleDetails={handleDetails} handleAssign={handleAssign} />
        </Col>
      </Row>
    </Container>
  );
}
export default Driver;
