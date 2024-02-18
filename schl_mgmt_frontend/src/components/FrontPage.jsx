import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import Cookies from 'js-cookie';

function FrontPage() {
  const [schoolData, setSchoolData] = useState(null);
  const [day, setDay] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const fetchData = async () => {
    try {
      const id = Cookies.get('schoolId');
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/schools/getschool/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setSchoolData(data);
    } catch (error) {
      console.error('Error fetching school data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTimingUpdate = async (e) => {
    e.preventDefault();

    try {
      const id = Cookies.get('schoolId');
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/schools/update-timing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId: id,
          day,
          openTime,
          closeTime
        })
      });
      const data = await response.json();
      console.log(data.message);
      // Refresh school data after update
      fetchData();
      // Close the update form
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error updating timings:', error);
    }
  };

  return (
    <Container fluid className="mt-3">
      {schoolData && (
        <>
          <Row>
            <Col>
              <h2 className="mb-4 text-center">School Timings</h2>
              <Card bg="light" className="rounded p-3 mb-3">
                <ul className="list-unstyled text-center">
                  {schoolData.school.timings && schoolData.school.timings.map((timing, index) => (
                    <li key={index} className="mb-2">
                      <strong>{timing.day}:</strong> {timing.openTime} - {timing.closeTime}
                    </li>
                  ))}
                </ul>
              </Card>
              {!showUpdateForm && (
                <Button variant="primary" onClick={() => setShowUpdateForm(true)} block>
                  Add School Timings
                </Button>
              )}
            </Col>
          </Row>

          {showUpdateForm && (
            <Row>
              <Col md={{ span: 6, offset: 3 }}>
                <Card bg="light" className="rounded p-3 mb-3">
                  <h5 className="text-center mb-4">Update Timings</h5>
                  <Form onSubmit={handleTimingUpdate}>
                    <Form.Group controlId="formDay">
                      <Form.Control type="text" placeholder="Enter day" value={day} onChange={(e) => setDay(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="formOpenTime">
                      <Form.Control type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="formCloseTime">
                      <Form.Control type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} required />
                    </Form.Group>
                    <Button variant="primary" type="submit" block>Update</Button>
                    <Button variant="secondary" onClick={() => setShowUpdateForm(false)} block>Close</Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={{ span: 6, offset: 3 }}>
              <Card bg="light" className="rounded p-3">
                <h5 className="text-center mb-4">School Details</h5>
                <div className="text-center mb-4">
                  <p><strong>Branch Name:</strong> {schoolData.school.branchName}</p>
                  <p><strong>Number of Students:</strong> {schoolData.school.numberOfStudents}</p>
                  <p><strong>Address:</strong> {schoolData.school.address}</p>
                  <p><strong>City:</strong> {schoolData.school.city}</p>
                  <p><strong>Number of Gates:</strong> {schoolData.school.numberOfGates}</p>
                  <p><strong>Status:</strong> {schoolData.school.status}</p>
                  <p><strong>Email:</strong> {schoolData.school.email}</p>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default FrontPage;
