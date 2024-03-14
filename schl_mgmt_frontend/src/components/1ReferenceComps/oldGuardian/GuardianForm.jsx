// GuardianForm.js
import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const GuardianForm = ({ formData, handleFormChange, emailError, cnicError, error,handleFormSubmit }) => (
    <Form onSubmit={handleFormSubmit}>
    <Form.Group controlId="formNameG">
      <Form.Label>Name</Form.Label>
      <Form.Control type="text" placeholder="Enter name" name="name" value={formData.name} onChange={handleFormChange} />
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
      <Form.Control type="email" placeholder="Enter email" name="email" value={formData.email} onChange={handleFormChange} onBlur={handleEmailBlur} />
      {emailError && <div className="error" style={{ color: "red" }}>{emailError}</div>}
    </Form.Group>
   
    <Button variant="primary" type="submit">
      Save
    </Button>
    {error && <Alert variant="danger">{error}</Alert>}
  </Form>
);

export default GuardianForm;
