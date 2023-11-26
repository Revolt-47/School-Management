import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

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

const ResetPassword = () => {
  const { schoolId, resetToken, expirationTime } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the reset link has expired
    if (expirationTime < Date.now()) {
      setMessage({
        text: 'Reset link has expired',
        variant: 'danger',
      });
    }
  }, [expirationTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/schools/resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          resetToken,
          expirationTime,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage({
          text: 'Password reset successful.',
          variant: 'success',
        });
        // Optionally, you can redirect the user to the sign-in page after a successful password reset
        // navigate('/signIn'); 
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
      console.error('Error during password reset:', error);

      setMessage({
        text: 'An error occurred. Please try again.',
        variant: 'danger',
      });
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
                <h3 style={{ marginBottom: '30px' }}>Reset Password</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formNewPassword" className="mb-4">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Form>

                {message && <Alert variant={message.variant}>{message.text}</Alert>}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section style={rightHalfStyle}>
        {/* You can include any content you want on the right side */}
      </section>
    </main>
  );
};

export default ResetPassword;
