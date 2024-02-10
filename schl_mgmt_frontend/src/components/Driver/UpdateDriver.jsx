import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const UpdateDriver = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const schoolId = Cookies.get('schoolId');

  const [driverDetails, setDriverDetails] = useState(null);
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true); // State to track email validation

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/driver/getDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverId }, schoolId)
        });
        const data = await response.json();
        setDriverDetails(data);
        setContactNumber(data.contactNumber);
        setEmail(data.email);
      } catch (error) {
        console.error('Error fetching driver details:', error);
      }
    };

    fetchDriverDetails();
  }, [driverId]);

  const handleUpdate = async () => {
    // Validate email format before updating
    if (!validateEmail(email)) {
      setEmailValid(false);
      return;
    }
    
    try {
      await fetch(`http://localhost:3000/driver/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactNumber, email }, schoolId)
      });
      navigate('/');
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="bg-light p-4 rounded">
            <h2 className="mb-4">Update Driver Information</h2>
            {driverDetails && (
              <div className="mb-4">
                <p><strong>Current Contact Number:</strong> {driverDetails.contactNumber}</p>
                <p><strong>Current Email:</strong> {driverDetails.email}</p>
              </div>
            )}
            <Form>
              <Form.Group controlId="formContactNumber">
                <Form.Label>New Contact Number:</Form.Label>
                <Form.Control
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>New Email:</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!emailValid} // Mark as invalid if email is not valid
                />
                {/* Display error message if email is not valid */}
                {!emailValid && <Form.Control.Feedback type="invalid">Please enter a valid email address.</Form.Control.Feedback>}
              </Form.Group>
              <Button variant="primary" type="button" onClick={handleUpdate}>
                Update Driver
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateDriver;
