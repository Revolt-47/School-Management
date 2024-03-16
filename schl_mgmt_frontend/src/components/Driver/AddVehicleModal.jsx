import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Cookies from 'js-cookie';

const AddVehicleModal = ({ showModal, driverId, setShowAddVModal, updateDriver }) => {
  const token = Cookies.get('token');
  const [newVehicle, setNewVehicle] = useState({
    regNumber: '',
    company: '',
    modelName: '',
    type: ''
  });

  const handleCloseModal = () => {
   setShowAddVModal(false);
    setNewVehicle({
      regNumber: '',
      company: '',
      modelName: '',
      type: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveVehicle = async () => {
    try {
      const response = await fetch(`http://localhost:3000/driver/${driverId}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVehicle)
      });
      await response.json();
      console.log('Add Vehicle Response:', response);
      if(response.status === 200) {
        alert('Vehicle added successfully');
        updateDriver();
      }
      else {
        alert('Error adding vehicle');
      }
      setShowAddVModal(false);
      setNewVehicle({
        regNumber: '',
        company: '',
        modelName: '',
        type: ''
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Vehicle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formRegNumber">
            <Form.Label>Registration Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter registration number"
              name="regNumber"
              value={newVehicle.regNumber}
              onChange={handleInputChange}
            />
            </Form.Group>
            <Form.Group controlId="formCompany">
                <Form.Label>Company</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter company"
                    name="company"
                    value={newVehicle.company}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Form.Group controlId="formModelName">
                <Form.Label>Model Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter model name"
                    name="modelName"
                    value={newVehicle.modelName}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Form.Group controlId="formType">
                <Form.Label>Type</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter type"
                    name="type"
                    value={newVehicle.type}
                    onChange={handleInputChange}
                />
            </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveVehicle}>
          Save Vehicle
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddVehicleModal;
