import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form } from 'react-bootstrap';
import Cookies from 'js-cookie';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    rollNumber: '',
    rfidTag: '',
    section: '',
    studentClass: '',
  });

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('http://localhost:3000/students/students/schoolId', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleModalShow = () => setShowModal(true);

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
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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
  
      if (!response.ok) {
        // Check for duplicate key violation
        if (response.status === 409) {
          // Parse the response body as JSON
          const responseBody = await response.json();
          // Display alert for duplicate key violation
          alert(responseBody.error);
        } else {
          // Handle other errors (you may want to display a more specific message)
          alert('An error occurred while adding/updating student. Please try again later.');
        }
        return; // Do not proceed further on error
      }
  
      handleModalClose();
      fetchStudents();
    } catch (error) {
      console.error('Error adding/updating student:', error);
      alert('An unexpected error occurred. Please try again later.');
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
    handleModalShow();
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
      <Row>
        <Col>
          <Button variant="primary" onClick={handleModalShow}>
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
