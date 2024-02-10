import React, { useState, useEffect } from 'react';
import { Table, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

// Other imports...

const DriverStudent = () => {
    const navigate = useNavigate();
    const { driverId } = useParams();
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const token = Cookies.get('token');
    const schoolId = Cookies.get('schoolId');
    const [relation, setRelation] = useState('both'); // Default to 'pickup', or set it as needed
  
    useEffect(() => {
      const fetchStudents = async () => {
        try {
          const response = await fetch(`http://localhost:3000/students/students/${schoolId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setStudents(data.students);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };
  
      fetchStudents();
    }, [schoolId]);
  
    const handleAssign = async () => {
      try {
        const promises = selectedStudents.map(studentId =>
          fetch('http://localhost:3000/driver/addStudent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ driverId, studentId, relation }),
          })
        );
  
        await Promise.all(promises);
        navigate('/');
      } catch (error) {
        console.error('Error assigning student to driver:', error);
      }
    };
  
    const handleCheckboxChange = (event, studentId) => {
      if (event.target.checked) {
        setSelectedStudents(prevState => [...prevState, studentId]);
      } else {
        setSelectedStudents(prevState => prevState.filter(id => id !== studentId));
      }
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
                    title="Select Relation"
                    onSelect={(eventKey) => {
                      setRelation(eventKey);
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
  