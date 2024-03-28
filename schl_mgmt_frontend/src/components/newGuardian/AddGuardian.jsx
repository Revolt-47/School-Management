import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import Cookies from 'js-cookie';

const AddGuardian = ({ showModal, setShowModal, setFormData, formData, studentId }) => {

    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [cnicError, setCnicError] = useState('');

    const handleModalClose = () => {
        setShowModal(false);
        setFormData({
            name: '',
            cnic: '',
            address: '',
            contactNumber: '',
            email: '',
            relation: '',
            children: []
        });
        setEmailError(''); // Clear email error on modal close
        setCnicError(''); // Clear cnic error on modal close

        setError(null); // Clear error on modal close
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        
        // Check if the input is CNIC
        if (name === 'cnic') {
            // Remove non-digit characters from input value
            const strippedValue = value.replace(/\D/g, '');
            
            // Format CNIC as per pattern
            let formattedCnic = '';
            for (let i = 0; i < strippedValue.length; i++) {
                if (i === 5 || i === 12) {
                    formattedCnic += '-';
                }
                formattedCnic += strippedValue[i];
            }
    
            if (strippedValue.length <= 13) {
                setFormData((prevData) => ({ ...prevData, [name]: formattedCnic }));
                if (strippedValue.length === 13) {
                    setCnicError('');
                } else {
                    setCnicError('CNIC must be 13 digits long');
                }
            }
        } else {
            // For other form fields, just set the value
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };
    
    

    const handleEmailBlur = (event) => {
        const { value } = event.target;
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(value)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        console.log('studentId:', studentId);
        if (
            cnicError ||
            !formData.name ||
            !formData.cnic ||
            !formData.address ||
            !formData.contactNumber ||
            !formData.email ||
            !formData.relation
        ) {
            setError('Please fill all the required fields.');
            return;
        }
        if (emailError) {
            return;
        }
        try {
            // an object named as child that contains stundet id and student relation
            const child = {
                child: studentId.current,
                relation: formData.relation
            };
            const children = [child];
            const token = Cookies.get('token');
            formData.children = children;
            console.log("Form data:", formData);

            await fetch('http://localhost:3000/guardians/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            }).then(
                    (response) => {
                        console.log('Response:', response);
                        if (response.status >= 400) {
                            if(response.status === 400)
                                setError(response.error);
                            throw new Error(response.error);
                        }
                        else {
                            alert("Guardian added successfully");
                            setShowModal(false);
                            setFormData({
                                name: '',
                                cnic: '',
                                address: '',
                                contactNumber: '',
                                email: '',
                                relation: '',
                                children: []
                            });
                        }
                    }
                );
        } catch (error) {
            console.error('Error adding guardian:', error);
            setError(error.message);
        }
    };

    return (
        <div>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Guardian</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                                onBlur={handleEmailBlur}
                            />
                            {cnicError && <div className="error" style={{ color: 'red' }}>{cnicError}</div>}
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
                            {emailError && <div className="error" style={{ color: 'red' }}>{emailError}</div>}
                        </Form.Group>
                        <Form.Group controlId="formRelationG">
                            <Form.Label>Relation</Form.Label>
                            <Form.Select
                                aria-label="Select relation"
                                name="relation"
                                value={formData.relation}
                                onChange={handleFormChange}
                            >
                                <option value="">Select relation</option>
                                <option value="father">Father</option>
                                <option value="mother">Mother</option>
                                <option value="guardian">Guardian</option>
                            </Form.Select>
                        </Form.Group>


                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                        {error && <Alert variant="danger">{error}</Alert>}
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AddGuardian;
