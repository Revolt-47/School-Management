import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';

const DriverDetails = () => {
  const [driver, setDriver] = useState(null);
  const [schoolUsernames, setSchoolUsernames] = useState([]);
  const token = Cookies.get('token');
  const { driverId } = useParams();

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/driver/getDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverId }),
        });
        const data = await response.json();
        setDriver(data);

        // Fetch school usernames
        const schoolIds = data.schools.map(school => school);
        const schoolUsernamesPromises = schoolIds.map(id => fetchSchoolUsername(id));
        const usernames = await Promise.all(schoolUsernamesPromises);
        setSchoolUsernames(usernames);
        //console.log(driver.students[0].student);
      } catch (error) {
        console.error('Error fetching driver details:', error);
      }
    };

    fetchDriverDetails();
  }, [driverId]);

  const fetchSchoolUsername = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/schools/getSchool/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      return data.school.username;
    } catch (error) {
      console.error('Error fetching school details:', error);
      return '';
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="bg-light p-4 rounded">
            <h2 className="mb-4">Driver Details</h2>
            {driver && (
              <div>
                <p><strong>Name:</strong> {driver.name}</p>
                <p><strong>CNIC:</strong> {driver.cnic}</p>
                <p><strong>Contact Number:</strong> {driver.contactNumber}</p>
                <p><strong>Email:</strong> {driver.email}</p>
                <p><strong>Schools:</strong> {schoolUsernames.join(', ')}</p>
                {driver.vehicles.length > 0 && (
                  <div>
                    <strong>Vehicles:</strong>
                    <ul>
                      {driver.vehicles.map(vehicle => (
                        <li key={vehicle._id}>
                          {vehicle.regNumber} - {vehicle.company} - {vehicle.modelName} - {vehicle.type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {driver.students.length > 0 && (
                  <div>
                    <strong>Students:</strong>
                    <ul>
                      {driver.students.map(student => (
                        <li key={student._id}>
                          {student.student} - Relation: {student.relation}
                        </li>
                        
                      ))}
                      
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DriverDetails;
