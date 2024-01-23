import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import Cookies from 'js-cookie';

const Guardian = () => {
  const [guardians, setGuardians] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    address: '',
    contactNumber: '',
    email: '',
    children: [],
  });

  const [selectedGuardianId, setSelectedGuardianId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuardians();
    fetchStudents();
  }, []);

  const fetchGuardians = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('http://localhost:3000/guardians/getAllGuardians', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setGuardians(data);
    } catch (error) {
      console.error('Error fetching guardians:', error);
    }
  };

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

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      name: '',
      cnic: '',
      address: '',
      contactNumber: '',
      email: '',
      children: [],
    });
    setSelectedGuardianId(null);
    setError(null); // Clear error on modal close
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
        method: selectedGuardianId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      };
  
      const apiUrl = selectedGuardianId
        ? `http://localhost:3000/guardians/${selectedGuardianId}`
        : 'http://localhost:3000/guardians/create';
  
      const response = await fetch(apiUrl, requestOptions);
      const result = await response.json();
  
      if (!response.ok) {
        // Check for duplicate key violation
        if (response.status === 409) {
          setError('Duplicate key violation. Guardian with the same email or CNIC already exists.');
        } else {
          // Handle other errors
          setError('An error occurred while saving the guardian information.');
        }
        return; // Do not proceed further on error
      }
  
      if (
        result.message === 'Guardian account created successfully.' ||
        result.message === 'Guardian updated successfully.'
      ) {
        if (formData.children.length > 0) {
          const assignChildrenRequestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              guardianId: selectedGuardianId || result.guardian._id,
              children: formData.children,
            }),
          };
  
          await fetch('http://localhost:3000/guardians/assign-child', assignChildrenRequestOptions);
        }
  
        handleModalClose();
        fetchGuardians();
      }
    } catch (error) {
      console.error('Error adding/updating guardian:', error);
      setError('An unexpected error occurred.');
    }
  };
  

  const handleSelectChildren = (selectedChildren) => {
    setFormData((prevData) => ({
      ...prevData,
      children: selectedChildren,
    }));
  };

  const handleModalShow = () => {
    setShowModal(true);
    setError(null); // Clear error on modal show
  };

  const handleEdit = (guardianId) => {
    const selectedGuardian = guardians.find((guardian) => guardian._id === guardianId);
    setFormData({
      name: selectedGuardian.name,
      cnic: selectedGuardian.cnic,
      address: selectedGuardian.address,
      contactNumber: selectedGuardian.contactNumber,
      email: selectedGuardian.email,
      children: selectedGuardian.children,
    });
    setSelectedGuardianId(guardianId);
    setShowModal(true);
  };

  const handleDelete = async (guardianId) => {
    try {
      const token = Cookies.get('token');
      const requestOptions = {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await fetch(`http://localhost:3000/guardians/${guardianId}`, requestOptions);
      fetchGuardians();
    } catch (error) {
      console.error('Error deleting guardian:', error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Button variant="primary" onClick={handleModalShow}>
            Add Guardian
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
                <th>Address</th>
                <th>Contact Number</th>
                <th>Email</th>
                <th>Children</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guardians && guardians.length > 0 ? (
                guardians.map((guardian) => (
                  <tr key={guardian._id}>
                    <td>{guardian.name}</td>
                    <td>{guardian.cnic}</td>
                    <td>{guardian.address}</td>
                    <td>{guardian.contactNumber}</td>
                    <td>{guardian.email}</td>
                    <td>{guardian.children.length}</td>
                    <td>
                      <Button variant="info" onClick={() => handleEdit(guardian._id)}>
                        Edit
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleDelete(guardian._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No guardians found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedGuardianId ? 'Edit Guardian' : 'Add Guardian'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formNameG">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formCNICG">
              <Form.Label>CNIC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter CNIC"
                name="cnic"
                value={formData.cnic}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formAddressG">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactNumberG">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmailG">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group controlId="formChildren">
              <Form.Label>Children</Form.Label>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <Form.Check
                    key={student._id}
                    type="checkbox"
                    label={student.name}
                    value={student._id}
                    checked={formData.children.includes(student._id)}
                    onChange={(e) => {
                      const selectedChildren = e.target.checked
                        ? [...formData.children, e.target.value]
                        : formData.children.filter((id) => id !== e.target.value);
                      handleSelectChildren(selectedChildren);
                    }}
                  />
                ))
              ) : (
                <div>No students available.</div>
              )}
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

export default Guardian;
