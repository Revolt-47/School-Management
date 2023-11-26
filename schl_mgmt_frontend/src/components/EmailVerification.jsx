import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const EmailVerification = () => {
  const { schoolId } = useParams();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/schools/verify-email/${schoolId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        setVerificationStatus(data.message);
      } catch (error) {
        console.error('Error during email verification:', error);
        setVerificationStatus('An error occurred during email verification.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [schoolId]);

  const getStatusVariant = () => {
    if (verificationStatus && verificationStatus.includes('success')) {
      return 'success';
    } else if (verificationStatus && verificationStatus.includes('School is already verified')) {
      return 'warning';
    } else {
      return 'danger';
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div style={{ backgroundColor: 'white', padding: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
            {loading && <p>Loading...</p>}
            {verificationStatus && (
              <>
                <Alert variant={getStatusVariant()}>
                  {verificationStatus}
                </Alert>
                <Button variant="dark" as={Link} to="/signIn" style={{ width: '100%' }}>
                  Back to Sign In
                </Button>
                <p style={{ fontSize: '15px', textAlign: 'center' }}>
                  {verificationStatus.includes('success') ? (
                    <>
                      You can now <Link to="/signIn" style={{ color: 'black' }}>sign in</Link> to your account.
                    </>
                  ) : (
                    <>
                      If you continue to face issues, please contact support.
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailVerification;
