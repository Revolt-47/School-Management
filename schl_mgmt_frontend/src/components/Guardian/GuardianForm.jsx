// GuardianForm.js
import React from 'react';
import { Modal, Form, Alert, Button } from 'react-bootstrap';

const GuardianForm = ({
    showModal,
    handleModalClose,
    selectedGuardianId,
    emailError,
    cnicError,
  error,
  formData,
  handleFormChange,
  handleEmailBlur,
  handleFormSubmit,
  students,
  handleSelectChildren,
}) => (
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
              {cnicError && <div className="error" style={{color:"red"}}>{cnicError}</div>}
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
                onBlur={handleEmailBlur}
              />
               {emailError && <div className="error" style={{color:"red"}}>{emailError}</div>}
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
);

export default GuardianForm;
