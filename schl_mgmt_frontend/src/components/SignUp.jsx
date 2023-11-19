import React, { useState } from 'react';
import './signUp.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import image from '../van guardian logo.png';

const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [showValidationError, setShowValidationError] = useState(false); // New state for validation errors

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    schoolType: '',
    studentsCount: '',
    gatesCount: '',
  });

  const containerStyle = {
    display: "flex",
    height: "92vh",
    padding: "60px",
    justifyContent: "space-around",
    overflowX: "hidden", // Hide horizontal overflow
    overflowY: "auto", // Add vertical scroll if needed
  };

  const leftHalfStyle = {
    flex: "1",
    marginLeft: "-200px",
  };

  const rightHalfStyle = {
    flex: "1",
    padding: "20px",
    marginRight: "-100px",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // Reset validation error when user types in step 1
    if (step === 1) {
      setShowValidationError(false);
    }
  };

  const handleNextStep = () => {
    // Validate step 1 fields
    if (
      step === 1 &&
      (!formData.username ||
        !formData.email ||
        !formData.contactNumber ||
        !formData.password ||
        !formData.confirmPassword)
    ) {
      setShowValidationError(true);
      return;
    }

    // Validate other steps if needed

    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your registration logic here
    console.log('Form submitted:', formData);
  };

  return (
    <main style={containerStyle}>
      <section style={leftHalfStyle}>
        <Container fluid>
          {/* Step Indicators */}
          <Row className="mb-4 justify-content-center">
            <Col xs="auto">
              <div className={`step-indicator ${step === 1 ? 'active' : ''}`}>1</div>
            </Col>
            <Col xs="auto">
              <div className={`step-indicator ${step === 2 ? 'active' : ''}`}>2</div>
            </Col>
          </Row>
          {/* Form */}
          <Row className="mt-5 align-items-start justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <div className="form-container" style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: '30px' }}>Welcome</h3>

                {/* Heading */}
                <h3 style={{ marginBottom: '30px', textAlign: 'center' }}>Registration Form</h3>

                <Form onSubmit={handleSubmit}>
                  {/* Step 1: Account Information */}
                  {step === 1 && (
                    <>
                      <Form.Group controlId="username" className="mb-4">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      {/* Add other account information fields (email, contactNumber, password, confirmPassword) here */}
                      <Form.Group controlId="email" className="mb-4">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter Email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="contactNumber" className="mb-4">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Contact Number"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="password" className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter Password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="confirmPassword" className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      {showValidationError && (
                        <p style={{ color: 'red', marginBottom: '10px' }}>
                          Please fill in all fields before proceeding.
                        </p>
                      )}

                      <Button variant="dark" onClick={handleNextStep} className="mb-4" style={{ width: '100%' }}>
                        Next
                      </Button>
                    </>
                  )}

                  {/* Step 2: School Information */}
                  {step === 2 && (
                    <>
                      <Form.Group controlId="schoolType" className="mb-4">
                        <Form.Label>School Type</Form.Label>
                        <Form.Control
                          as="select"
                          name="schoolType"
                          value={formData.schoolType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select School Type</option>
                          <option value="private">Private</option>
                          <option value="government">Government</option>
                        </Form.Control>
                      </Form.Group>

                      {/* Add other school information fields (studentsCount, gatesCount) here */}
                      <Form.Group controlId="studentsCount" className="mb-4">
                        <Form.Label>Number of Students</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Number of Students"
                          name="studentsCount"
                          value={formData.studentsCount}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="gatesCount" className="mb-4">
                        <Form.Label>Number of Gates</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Number of Gates"
                          name="gatesCount"
                          value={formData.gatesCount}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Button variant="dark" type="submit" className="mb-4" style={{ width: '100%' }}>
                        Register
                      </Button>
                      <p style={{ fontSize: '15px', textAlign: 'center' }}>
                        <span onClick={handlePrevStep} style={{ cursor: 'pointer', color: 'purple' }}>Previous</span>
                      </p>
                    </>
                  )}
                </Form>

                {/* Navigation links */}
                <p style={{ fontSize: '15px', marginTop: '10px', textAlign: 'center' }}>
                  Already have an account? <Link to="/signIn" style={{ color: 'black' }}>Sign In</Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section style={rightHalfStyle}>
        <img src={image} alt="logo" style={{ maxWidth: "100%", maxHeight: "100%" }} />
      </section>
    </main>
  );
};

export default SignUpForm;
