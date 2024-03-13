import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BiCar, BiChevronDown, BiBuilding, BiSolidWatch } from 'react-icons/bi';
import StudentCountBox from './StudentCountBox';
import logo from './van guardian logo.png';

function FrontPage() {
  const [schoolData, setSchoolData] = useState(null);
  const [day, setDay] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const school = JSON.parse(Cookies.get('school'));
  const [updateFormOpen, setUpdateFormOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/schools/getschool/${school._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.status === 401) {
        navigate('/login');
      }
      setSchoolData(data);

      const studentsResponse = await fetch(`http://localhost:3000/students/totalcount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const studentsData = await studentsResponse.json();
      setTotalStudents(studentsData.totalStudentsCount);

      const driversResponse = await fetch(`http://localhost:3000/driver/getAllDriversofSchool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const driversData = await driversResponse.json();
      setTotalDrivers(driversData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [navigate, school._id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTimingUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/schools/update-timing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId: school._id,
          day,
          openTime,
          closeTime,
        }),
      });
      const data = await response.json();
      console.log(data.message);
      fetchData();
      setUpdateFormOpen(false);
    } catch (error) {
      console.error('Error updating timings:', error);
    }
  };

  const formatLocalTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { timeStyle: 'short' });
  };

  return (
    <div style={{ height: '100vh' }}>
      <div className="front-page" style={{ backgroundImage: `url(${logo})` }}>
        <Container fluid className="mt-3">
          {schoolData && (
            <Row>
              <Col md={3}>
                <Card bg="light" className="rounded p-3 mb-3" style={{ width: '350px' }}>
                  <div className="d-flex align-items-center mb-4">
                    <BiBuilding size={50} color="#007bff" className="mr-2" />
                    <h4 className="mb-0">School Details</h4>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <tbody>
                        <tr>
                          <td><strong>Branch Name:</strong></td>
                          <td>{schoolData.school.branchName}</td>
                        </tr>
                        <tr>
                          <td><strong>Address:</strong></td>
                          <td>{schoolData.school.address}</td>
                        </tr>
                        <tr>
                          <td><strong>City:</strong></td>
                          <td>{schoolData.school.city}</td>
                        </tr>
                        <tr>
                          <td><strong>Number of Gates:</strong></td>
                          <td>{schoolData.school.numberOfGates}</td>
                        </tr>
                        <tr>
                          <td><strong>Status:</strong></td>
                          <td>{schoolData.school.status}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{schoolData.school.email}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card bg="light" className="rounded p-3 mb-3">
                  <div className="d-flex align-items-center mb-4">
                    <BiSolidWatch size={50} color="#007bff" className="mr-2" />
                    <h4 className="mb-0">School Timings</h4>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Arrival</th>
                        <th>Departure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolData.school.timings && schoolData.school.timings.map((timing, index) => (
                        <tr key={index}>
                          <td>{timing.day}</td>
                          <td>{formatLocalTime(timing.openTime)}</td>
                          <td>{formatLocalTime(timing.closeTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                {!showUpdateForm && (
                  <Button variant="primary" onClick={() => setShowUpdateForm(true)}>
                    Add School Timings
                  </Button>
                )}
                <Collapse in={showUpdateForm}>
                  <div>
                    <Card bg="light" className="rounded p-3 mb-3">
                      <h5 className="text-center mb-4">Update Timings</h5>
                      <Form onSubmit={handleTimingUpdate}>
                        <Form.Group controlId="formDay">
                          <div className="position-relative">
                            <Form.Control as="select" value={day} onChange={(e) => setDay(e.target.value)} required>
                              <option value="" disabled>Select a day</option>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </Form.Control>
                            <BiChevronDown className="position-absolute top-50 end-0 translate-middle-y" style={{ fontSize: '1.5rem', color: '#007bff', marginRight: '5px' }} />
                          </div>
                        </Form.Group>
                        <Form.Group controlId="formOpenTime">
                          <Form.Control type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="formCloseTime">
                          <Form.Control type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit">Update</Button>
                        <Button variant="secondary" onClick={() => setShowUpdateForm(false)}>Close</Button>
                      </Form>
                    </Card>
                  </div>
                </Collapse>
              </Col>

              <Col md={3} className="d-flex flex-column align-items-end">
                <img src={logo} alt="Logo" style={{ width: '150px', marginRight: "100px" }} />
                <StudentCountBox totalStudents={totalStudents} />
                <Card bg="light" className="rounded p-2 mt-3" style={{ width: '200px', border: '1px solid black', boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)', marginRight: "60px" }}>
                  <div className="d-flex align-items-center mb-2">
                    <BiCar size={30} color="#007bff" className="mr-2" />
                    <h5 className="mb-0">Drivers</h5>
                  </div>
                  <div className="text-center">
                    <p><strong>Total:</strong> {totalDrivers}</p>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
}

export default FrontPage;
