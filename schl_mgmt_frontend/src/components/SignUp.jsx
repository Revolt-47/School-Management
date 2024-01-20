import React, { useState } from 'react';
import './signUp.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import image from '../van guardian logo.png';

const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showPasswordMismatchError, setShowPasswordMismatchError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    schoolType: '',
    numberofStudents: '',
    numberofGates: '',
    branchName: '',  // Added field for branchName
    address: '',     // Added field for address
    city: '',        // Added field for city
  });
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    flexWrap: 'wrap',
    overflow: 'visible',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
  };
  const formStyle = {
    flex: '1',
    marginRight: '30px',
  };

  const imageStyle = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setShowValidationError(false);
    setShowPasswordMismatchError(false);
  // Check if the input is password
  if (name === 'password') {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(value)) {
      setPasswordError('Password must be at least 8 characters long and contain at least one uppercase letter');
      return;
    } else {
      setPasswordError('');
    }
  }

  // Update the form data
  setFormData({
    ...formData,
    [name]: value
  });
  };

  const handleEmailBlur = (event) => {
    const { value } = event.target;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const handleNextStep = async () => {
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

    if (step === 1 && formData.password !== formData.confirmPassword) {
      setShowPasswordMismatchError(true);
      return;
    }

    if (emailError || passwordError) {
      return;
    }
    setShowValidationError(false);
    setShowPasswordMismatchError(false);

    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/schools/register-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          numberOfStudents: formData.numberofStudents,
          numberOfGates: formData.numberofGates,
        }),
      });

      if (response.status === 201) {
        setApiResponse({ success: true, message: 'Registration successful! Check your email' });
      } else if (response.status === 200) {
        setApiResponse({ success: false, message: 'User with the entered username already exists.' });
      }else if(response.status === 406){
        setApiResponse({ success: false, message: 'User with the entered email already exists.' }); 
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error during API request:', error);
      // Handle specific error scenarios and show user-friendly messages
      setApiResponse({ success: false, message: 'An error occurred during registration.' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <main style={containerStyle}>
      <section style={formStyle}>
        <Container fluid>
          <Row className="mb-4 justify-content-center">
            <Col xs="auto">
              <div className={`step-indicator ${step === 1 ? 'active' : ''}`}>1</div>
            </Col>
            <Col xs="auto">
              <div className={`step-indicator ${step === 2 ? 'active' : ''}`}>2</div>
            </Col>
          </Row>
          <Row className="mt-5 align-items-start justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <div className="form-container" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '30px' }}>Welcome</h3>
                <h3 style={{ marginBottom: '30px', textAlign: 'center' }}>Registration Form</h3>
                <Form onSubmit={handleSubmit}>
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

                      <Form.Group controlId="email" className="mb-4">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter Email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleEmailBlur}
                          required
                        />
                      {emailError && <div className="error" style={{color:"red"}}>{emailError}</div>}
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
                      {passwordError && <div className="error" style={{color:"red"}}>{passwordError}</div>}
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
                      {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && <div className="password-match" style={{color:"green"}}>Passwords match</div>}
                      </Form.Group>

                      {showValidationError && (
                        <p style={{ color: 'red', fontSize: '15px' }}>Please fill all the fields</p>
                      )}

                      {showPasswordMismatchError && (
                        <p style={{ color: 'red', fontSize: '15px' }}>Passwords do not match</p>
                      )}

                      <p style={{ fontSize: '15px', textAlign: 'center' }}>
                        <span
                          onClick={handlePrevStep}
                          style={{ cursor: 'pointer', color: 'purple' }}
                        >
                          Previous
                        </span>
                      </p>


                      <Button
                        variant="dark"
                        type="button"
                        className="mb-4"
                        style={{ width: '100%' }}
                        onClick={handleNextStep}
                      >
                        Next Step
                      </Button>
                    </>
                  )}

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

                      <Form.Group controlId="branchName" className="mb-4">
                        <Form.Label>Branch Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Branch Name"
                          name="branchName"
                          value={formData.branchName}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="address" className="mb-4">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="city" className="mb-4">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter City"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="numberofStudents" className="mb-4">
                        <Form.Label>Number of Students</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Number of Students"
                          name="numberofStudents"
                          value={formData.numberofStudents}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group controlId="numberofGates" className="mb-4">
                        <Form.Label>Number of Gates</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Number of Gates"
                          name="numberofGates"
                          value={formData.numberofGates}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>


                      {loading && <p>Loading...</p>}

                      <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        {apiResponse && apiResponse.success && (
                          <p style={{ color: 'green', fontSize: '15px' }}>{apiResponse.message}</p>
                        )}
      
                        {apiResponse && !apiResponse.success && (
                          <p style={{ color: 'red', fontSize: '15px' }}>{apiResponse.message}</p>
                        )}
                      </div>

                      <Button
                        variant="dark"
                        type="submit"
                        className="mb-4"
                        style={{ width: '100%' }}
                      >
                        Register
                      </Button>
                      <p style={{ fontSize: '15px', textAlign: 'center' }}>
                        <span
                          onClick={handlePrevStep}
                          style={{ cursor: 'pointer', color: 'purple' }}
                        >
                          Previous
                        </span>
                      </p>
                    </>
                  )}
                </Form>

                <p style={{ fontSize: '15px', marginTop: '10px', textAlign: 'center' }}>
                  Already have an account? <Link to="/signIn" style={{ color: 'black' }}>Sign In</Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>



      <section style={imageStyle}>
        <img src={image} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </section>



    </main>
  );
};

export default SignUpForm;
