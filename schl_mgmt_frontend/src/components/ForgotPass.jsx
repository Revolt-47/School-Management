import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import image from '../van guardian logo.png';

const containerStyle = {
  display: 'flex',
  height: '92vh',
  padding: '60px',
  justifyContent: 'space-around',
};

const leftHalfStyle = {
  flex: '1',
  marginLeft: '-200px',
};

const rightHalfStyle = {
  flex: '1',
  padding: '20px',
  marginRight: '-100px',
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/schools/forget-pw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (response.ok) {
        setMessage({
          text: 'Password reset link sent successfully.',
          variant: 'success',
        });
      } else if (response.status === 404) {
        setMessage({
          text: 'User not found.',
          variant: 'danger',
        });
      } else {
        setMessage({
          text: 'An error occurred. Please try again.',
          variant: 'danger',
        });
      }
    } catch (error) {
      console.error('Error during password reset request:', error);

      // Check if user not found (404 status code)
      if (error.response && error.response.status === 404) {
        setMessage({
          text: 'User not found.',
          variant: 'danger',
        });
      } else {
        setMessage({
          text: 'An error occurred. Please try again.',
          variant: 'danger',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={containerStyle}>
      <section style={leftHalfStyle}>
        <Container fluid>
          <Row className="mt-5 align-items-start justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <div style={{ backgroundColor: 'white', padding: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
                <h3 style={{ marginBottom: '30px' }}>Forgot Password</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-4">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </Form>

                {message && <Alert variant={message.variant}>{message.text}</Alert>}
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

export default ForgotPassword;
