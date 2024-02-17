import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
const DriverDetails = () => {
  const navigate = useNavigate();
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
        //setDriver(data);
        const students = data.students.map(student => student.student);
        const studentNames = await fetchStudentNames(students);
        // setStudents(studentNames);
        //console.log('Student Names:', studentNames);
        data.students =data.students.map((student, index) => ({ ...student, name: studentNames[index] }));
        console.log('Updated Students:', data.students);
        console.log(studentNames);
        setDriver(data);
        //console.log('Updated Students:', driver.students);
        // Fetch school usernames
        const schoolIds = data.schools.map(school => school);
        const schoolUsernamesPromises = schoolIds.map(id => fetchSchoolUsername(id));
        const usernames = await Promise.all(schoolUsernamesPromises);
        setSchoolUsernames(usernames);
      } catch (error) {
        console.error('Error fetching driver details:', error);
      }
    };

    fetchDriverDetails();      
  }, [driverId]);

        
  const fetchStudentNames = async (studentIds) => {
    try {
        const studentsWithNames = [];
        for (const studentId of studentIds) {
            const response = await fetch('http://localhost:3000/students/getdetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Assuming you have a token variable accessible here
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studentId })
            });
            if (response.ok) {
                const studentData = await response.json();
                studentsWithNames.push(studentData.std.name);
            } else {
                console.error(`Error fetching details for student with ID ${studentId}: ${response.statusText}`);
            }
        }
        return studentsWithNames;
    } catch (error) {
        console.error('Error fetching student names:', error);
        return [];
    }
};


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

  const handleRemoveStudent = async (studentId) => {
    try {
      const response = await fetch('http://localhost:3000/driver/removeStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId, studentId }),
      });
      const data = await response.json();
      // Handle success message if needed
      console.log(data.message);
      alert(data.message);
      // Update driver details after removal
      const updatedDriver = { ...driver };
      updatedDriver.students = updatedDriver.students.filter(student => student._id !== studentId);
      setDriver(updatedDriver);

      // Fetch updated driver details
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
          
          const students = data.students.map(student => student.student);
        const studentNames = await fetchStudentNames(students);
        // setStudents(studentNames);
        //console.log('Student Names:', studentNames);
        data.students =data.students.map((student, index) => ({ ...student, name: studentNames[index] }));
        console.log('Updated Students:', data.students);
        console.log(studentNames);
        setDriver(data);
        } catch (error) {
          console.error('Error fetching driver details:', error);
        }
      };
  
      fetchDriverDetails();
    } catch (error) {
      console.error('Error removing student:', error);
      // Handle error if needed
    }
  };

  const handleRemoveVehicle = async (regNumber) => {
    try {
      const response = await fetch(`http://localhost:3000/driver/${driverId}/vehicles/${regNumber}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      // Handle success message if needed
      console.log(data.message);
      alert(data.message);
      // Update driver details after removal
      const updatedDriver = { ...driver };
      updatedDriver.vehicles = updatedDriver.vehicles.filter(vehicle => vehicle.regNumber !== regNumber);
      setDriver(updatedDriver);

      // Fetch updated driver details
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
        } catch (error) {
          console.error('Error fetching driver details:', error);
        }
      };
  
      fetchDriverDetails();
    } catch (error) {
      console.error('Error removing vehicle:', error);
      // Handle error if needed
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
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          {vehicle.regNumber} - {vehicle.company} - {vehicle.modelName} - {vehicle.type}
                          <Button variant="light" style={{ color: "red" }} size="sm" onClick={() => handleRemoveVehicle(vehicle.regNumber)}>Remove</Button>
                          </div>
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
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{student.name} - Relation: {student.relation}</span>
                            <Button variant="light" style={{ color: "red" }} size="sm" onClick={() => handleRemoveStudent(student.student)}>Remove</Button>
                          </div>
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
      <Button variant="primary" onClick={() => navigate('/')}>Back</Button>
    </Container>
  );
};

export default DriverDetails;
