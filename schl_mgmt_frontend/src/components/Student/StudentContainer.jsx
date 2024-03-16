// Student.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import Cookies from 'js-cookie';
import StudentList from './StudentList';
import StudentModal from './StudentModal';

const StudentContainer = () => {
  const school = JSON.parse(Cookies.get('school'));
  const schoolId = school._id;
    const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cnicError, setCnicError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    rollNumber: '',
    rfidTag: '',
    section: '',
    studentClass: '',
  });

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/students/students/${schoolId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      let data = await response.json();
  
      // If the search term is not empty, filter the students
      if (searchTerm.trim() !== '') {
        data.students = data.students.filter((student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [searchTerm]); // searchTerm is added as a dependency to re-fetch students on search


  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);


  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      name: '',
      cnic: '',
      rollNumber: '',
      rfidTag: '',
      section: '',
      studentClass: '',
    });
    setSelectedStudentId(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleFormChange = (e) => {
      const { name, value } = e.target;

      // Check if the input is CNIC
      if (name === 'cnic') {
        const cnicRegex = /^[0-9-]*$/;
        if (!cnicRegex.test(value)) {
          setCnicError('CNIC can only contain numbers and dashes');
          return;
        } else {
          setCnicError('');
        }
      }

      // Update the form data
      setFormData({
        ...formData,
        [name]: value
      });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const token = Cookies.get('token');
      const requestOptions = {
        method: selectedStudentId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      };

      const apiUrl = selectedStudentId
        ? `http://localhost:3000/students/edit/${selectedStudentId}`
        : 'http://localhost:3000/students/add';

      const response = await fetch(apiUrl, requestOptions);
      const result = await response.json();

      if (!response.ok) {
        // Check for duplicate key violation
        if (response.status === 409) {
          setError(result.error);
        } else {
          // Handle other errors
          setError('An error occurred while adding/updating student. Please try again later.'+result.error);
        }
        return; // Do not proceed further on error
      }

      setSuccessMessage(result.message);

      // Close the modal and fetch updated students on success
      handleModalClose();
      fetchStudents();
    } catch (error) {
      console.error('Error adding/updating student:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  const handleEdit = (studentId) => {
    const selectedStudent = students.find((student) => student._id === studentId);
    setSelectedStudentId(studentId);

    // Create a new object with all fields
    const editedFormData = {
      name: selectedStudent.name,
      cnic: selectedStudent.cnic,
      rollNumber: selectedStudent.rollNumber,
      rfidTag: selectedStudent.rfidTag,
      section: selectedStudent.section,
      studentClass: selectedStudent.studentClass,
    };

    setFormData(editedFormData);
    setShowModal(true);
    setError(null); // Clear error on modal show
  };

  const handleDelete = async (studentId) => {
    try {
      const token = Cookies.get('token');
      await fetch(`http://localhost:3000/students/delete/${studentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };


  return (
    <Container className="mt-5" style={{ height: '100vh', overflowY: 'auto' }}>
  <Form.Control
    type="text"
    placeholder="Search student by any credential"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      width: '50%',
      display: 'block',
      margin: '0 auto',
      position: 'sticky',
      top: 70,
      zIndex: 1000,
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 0 10px 3px rgba(0,0,0,0.2)',
      backgroundColor: '#f5f5f5',
    }}
  />
      <Row style={{marginTop:"100px"}}>
        <Col>
          <Button variant="primary" onClick={() => {
            
            setShowModal(true)
          }
            }>
            Add Student
          </Button>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <StudentList students={students} handleEdit={handleEdit} handleDelete={handleDelete} />
        </Col>
      </Row>
      <StudentModal
        showModal={showModal}
        handleModalClose={handleModalClose}
        selectedStudentId={selectedStudentId}
        error={error}
        formData={formData}
        handleFormChange={handleFormChange}
        cnicError={cnicError}
        handleFormSubmit={handleFormSubmit}
      />
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
    </Container>
  );
};

export default StudentContainer;
