import React, { useState, useEffect } from 'react';
import { Table, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

const DriverStudent = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();
  const [students, setStudents] = useState([]);
  const [driver, setDriver] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentRelations, setStudentRelations] = useState({});
  const token = Cookies.get('token');
  const schoolId = Cookies.get('schoolId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both students and driver details concurrently
        const [studentsResponse, driverDetailsResponse] = await Promise.all([
          fetch(`http://localhost:3000/students/students/${schoolId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:3000/driver/getDetails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ driverId }),
          })
        ]);
  
        // Extract data from responses
        const studentsData = await studentsResponse.json();
        const driverData = await driverDetailsResponse.json();
  
        // Set students state
        setStudents(studentsData.students);
  
        // Filter out students already assigned to the driver
        const assignedStudentIds = driverData.students.map(student => student.student);
        const unassignedStudents = studentsData.students.filter(student => !assignedStudentIds.includes(student._id));
        setStudents(unassignedStudents);
  
        // Set driver state
        setDriver(driverData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [schoolId, driverId]);
  


  const handleAssign = async () => {
    try {
      const promises = selectedStudents.map(studentId =>
        fetch('http://localhost:3000/driver/addStudent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverId, studentId, relation: studentRelations[studentId] }), // Use selected relation from state
        })
      );

      await Promise.all(promises);
      navigate('/');
    } catch (error) {
      console.error('Error assigning student to driver:', error);
    }
  };

  const handleCheckboxChange = (event, studentId) => {
    const defaultRelation = 'both'; // Set default relation to 'both'
    const isChecked = event.target.checked;
  
    if (isChecked) {
      setSelectedStudents(prevState => [...prevState, studentId]);
      // Set default relation for the selected student
      setStudentRelations(prevState => ({
        ...prevState,
        [studentId]: defaultRelation,
      }));
    } else {
      setSelectedStudents(prevState => prevState.filter(id => id !== studentId));
      // Remove the relation if unchecked
      setStudentRelations(prevState => {
        const updatedRelations = { ...prevState };
        delete updatedRelations[studentId];
        return updatedRelations;
      });
    }
  };

  const handleRelationChange = (eventKey, studentId) => {
    setStudentRelations(prevState => ({
      ...prevState,
      [studentId]: eventKey,
    }));
  };

  return (
    <div>
      <h2>Assign Students</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Select</th>
            <th>Student Name</th>
            <th>CNIC</th>
            <th>Roll Number</th>
            <th>RFID Tag</th>
            <th>Section</th>
            <th>Class</th>
            <th>Relation</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td>
                <input
                  type="checkbox"
                  onChange={(event) => handleCheckboxChange(event, student._id)}
                />
              </td>
              <td>{student.name}</td>
              <td>{student.cnic}</td>
              <td>{student.rollNumber}</td>
              <td>{student.rfidTag}</td>
              <td>{student.section}</td>
              <td>{student.studentClass}</td>
              <td>
                <DropdownButton
                  id={`dropdown-relation-${student._id}`}
                  title={studentRelations[student._id] || 'Select Relation'} // Display selected relation or default text
                  onSelect={(eventKey) => {
                    handleRelationChange(eventKey, student._id); // Pass studentId to handleRelationChange
                  }}
                >
                  <Dropdown.Item eventKey="pickup">Pickup</Dropdown.Item>
                  <Dropdown.Item eventKey="dropoff">Dropoff</Dropdown.Item>
                  <Dropdown.Item eventKey="both">Both</Dropdown.Item>
                </DropdownButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleAssign}>Assign Student</Button>
    </div>
  );
};

export default DriverStudent;