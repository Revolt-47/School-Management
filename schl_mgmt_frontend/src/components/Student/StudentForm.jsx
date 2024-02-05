// StudentForm.js
import React from 'react';
import { Form, Button } from 'react-bootstrap';

const StudentForm = ({ formData, handleFormChange, cnicError, handleFormSubmit }) => (
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
);

export default StudentForm;
