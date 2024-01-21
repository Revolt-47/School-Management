import React, { useState, useEffect,useCallback } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import Cookies from 'js-cookie';

const Student = () => {
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
      const response = await fetch('http://localhost:3000/students/students/schoolId', {
        headers: {
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
    
    <Container className="mt-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search student by any credential"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '50%', // Increase the width of the search box
                      display: 'block', // Make the search box a block element
                      margin: '0 auto', // Center the search box
                    }}
                  />
      <Row>
        <Col>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add Student
          </Button>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>CNIC</th>
                <th>Roll Number</th>
                <th>RFID Tag</th>
                <th>Section</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.cnic}</td>
                    <td>{student.rollNumber}</td>
                    <td>{student.rfidTag}</td>
                    <td>{student.section}</td>
                    <td>{student.studentClass}</td>
                    <td>
                      <Button variant="info" onClick={() => handleEdit(student._id)}>
                        Edit
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleDelete(student._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No students found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedStudentId ? 'Edit Student' : 'Add Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCNIC">
              <Form.Label>CNIC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter CNIC"
                name="cnic"
                value={formData.cnic}
                onChange={handleFormChange}
              />
              {cnicError && <div className="error" style={{color:"Red"}}>{cnicError}</div>}
            </Form.Group>
            <Form.Group controlId="formRollNumber">
              <Form.Label>Roll Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter roll number"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formRFIDTag">
              <Form.Label>RFID Tag</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter RFID tag"
                name="rfidTag"
                value={formData.rfidTag}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formSection">
              <Form.Label>Section</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter section"
                name="section"
                value={formData.section}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formClass">
              <Form.Label>Class</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter class"
                name="studentClass"
                value={formData.studentClass}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Student;
