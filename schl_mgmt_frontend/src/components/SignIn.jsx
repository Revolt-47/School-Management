import React from 'react';
import image from '../van guardian logo.png';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link} from 'react-router-dom';

const containerStyle = {
  display: "flex",
  height: "92vh",
  padding: "60px",
  justifyContent: "space-around",
}

const leftHalfStyle = {
  flex: "1",
  marginLeft: "-200px",
}

const rightHalfStyle = {
  flex: "1",
  padding: "20px",
  marginRight: "-100px"
}


function SignInPage() {
  return (
    <main style={containerStyle}>

      <section style={leftHalfStyle}>

        <Container fluid>
          <Row className="mt-5 align-items-start justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <div style={{ backgroundColor: 'white', padding: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
                <h3 style={{ marginBottom: '30px' }}>Welcome</h3>
                <p style={{ fontSize: '25px' }}>
                  Sign in to
                </p>
                <p style={{ fontSize: '25px', justifyContent: "center" }}>School Management Dashboard</p>

                <Form>
                  <Form.Group controlId="formBasicEmail" className="mb-4">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Enter Username" name="username" required />
                  </Form.Group>

                  <Form.Group controlId="formBasicPassword" className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter Password" name="password" required />
                  </Form.Group>

                  <Form.Group controlId="formBasicCheckbox" className="d-flex align-items-center mb-4 justify-content-between">
                    <Form.Check type="checkbox" label="Remember me" />
                    <p style={{ fontSize: '15px', marginBottom: '0' }}>
                      <a href="/forgot-password" style={{ color: 'black' }}>Forgot Password?</a>
                    </p>
                  </Form.Group>

                  <Button variant="dark" type="submit" className="mb-4" style={{ width: '100%' }}>
                    Login
                  </Button>
                </Form>

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
