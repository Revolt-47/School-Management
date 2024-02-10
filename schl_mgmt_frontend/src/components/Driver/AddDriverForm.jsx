import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Cookies from 'js-cookie';

const AddDriverForm = () => {
    const token = Cookies.get('token');
    const schoolId = Cookies.get('schoolId');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        cnic: '',
        contactNumber: '',
        email: '',
        vehicleRegNumber: '',
        vehicleCompany: '',
        vehicleModelName: '',
        vehicleType: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/driver/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    ...formData, 
                    schoolId,
                    vehicles: [{
                        regNumber: formData.vehicleRegNumber,
                        company: formData.vehicleCompany,
                        modelName: formData.vehicleModelName,
                        type: formData.vehicleType
                    }]
                }),
                 });
            const data = await response.json();
                 
            if (response.ok) {
                if(response.status === 200 && response.message === 'Vehicles added to an existing driver.')
                    alert('Vehicles added to an existing driver.');
                else
                alert('Driver added successfully!');
                navigate('/');
            }
            else {
                if(data.code === 11000)
                    alert('Driver or Car with same credentials  already exists');
                else
                alert(data.error || 'Failed to add driver');
            }

        } catch (error) {
            console.error('Error adding driver:', error);
        }

    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <h2 className="text-center mb-4">Add New Driver</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="cnic">
                            <Form.Label>CNIC</Form.Label>
                            <Form.Control type="text" name="cnic" value={formData.cnic} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="contactNumber">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="vehicleRegNumber">
                            <Form.Label>Vehicle Registration Number</Form.Label>
                            <Form.Control type="text" name="vehicleRegNumber" value={formData.vehicleRegNumber} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="vehicleCompany">
                            <Form.Label>Vehicle Company</Form.Label>
                            <Form.Control type="text" name="vehicleCompany" value={formData.vehicleCompany} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="vehicleModelName">
                            <Form.Label>Vehicle Model Name</Form.Label>
                            <Form.Control type="text" name="vehicleModelName" value={formData.vehicleModelName} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group controlId="vehicleType">
                            <Form.Label>Vehicle Type</Form.Label>
                            <Form.Control type="text" name="vehicleType" value={formData.vehicleType} onChange={handleChange} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" style={{width:"100%"}}>
                            Add Driver
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddDriverForm;
