import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import image from '../van guardian logo.png';
import Cookies from 'js-cookie';

const containerStyle = {
  display: "flex",
  height: "100vh",
  padding: "60px",
  justifyContent: "space-around",
  overflow: "hidden"
}

const leftHalfStyle = {
  alignSelf: "flex-start", // This will align the box to the start of the container
  width: "50%", // Adjust this as needed
  marginTop: "-50px", // Add some top margin to move it up
}

const rightHalfStyle = {
  flex: "1",
  padding: "20px",
  marginRight: "0px",
  height: "100%"
}

function SignInPage({ updateAuthenticationStatus }) {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/schools/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: e.target.username.value,
          password: e.target.password.value,
        }),
      });

      const data = await response.json();

      setApiResponse(data);

      if (response.ok) {
        //console.log('Login successful:', data);
        //console.log('Login successful:', data.school);

        const schoolToken = JSON.stringify(data.school);

        Cookies.set('token', data.token, { expires: 7 });
        Cookies.set('school', schoolToken, { expires: 7 });

        //const school =JSON.parse( Cookies.get('school') );
        //console.log('School Stored in cookie:', school);
        
        updateAuthenticationStatus(true);
        navigate('/');
      }
    } catch (error) {
      console.error('Error during API request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={containerStyle}>
      <section style={leftHalfStyle}>
        <Container fluid >
          <Row className="mt-5 align-items-start justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <div style={{ backgroundColor: 'white', padding: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
                <h3 style={{ marginBottom: '30px' }}>Welcome</h3>
                <p style={{ fontSize: '25px' }}>
                  Sign in to
                </p>
                <p style={{ fontSize: '25px', justifyContent: "center" }}>School Management Dashboard</p>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-4">
                    <Form.Label>Username or Email</Form.Label>
                    <Form.Control type="text" placeholder="Enter Username or Email" name="username" required />
                  </Form.Group>

                  <Form.Group controlId="formBasicPassword" className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter Password" name="password" required />
                  </Form.Group>

                  <Form.Group controlId="formBasicCheckbox" className="d-flex align-items-center mb-4 justify-content-between">
                    <Form.Check type="checkbox" label="Remember me" />
                    <p style={{ fontSize: '15px', marginBottom: '0' }}>
                      <Link to="/forgot-password" style={{ color: 'black' }}>Forgot Password?</Link>
                    </p>
                  </Form.Group>

                  <Button variant="dark" type="submit" className="mb-4" style={{ width: '100%' }}>
                    Login
                  </Button>
                </Form>

                {apiResponse && <p>{apiResponse.message}</p>}
                {loading && <p>Loading...</p>}

                <p style={{ fontSize: '15px', marginTop: '30px', textAlign: 'center' }}>
                  Don't have an account? <Link to="/signUp" style={{ color: 'black' }}>Register</Link>
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
}

export default SignInPage;
