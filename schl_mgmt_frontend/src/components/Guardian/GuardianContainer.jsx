import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';  // Import Form from react-bootstrap
import Cookies from 'js-cookie';
import GuardianList from './GuardianList';
import GuardianModal from './GuardianModal';

const GuardianContainer = () => {
    const [guardians, setGuardians] = useState([]);
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [cnicError, setCnicError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
  
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
  
    const fetchGuardians = useCallback(async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch('http://localhost:3000/guardians/getAllGuardians', {
        method: 'POST',  
        body: JSON.stringify({token}),
        });
        let data = await response.json();
  
        // If the search term is not empty, filter the guardians
        if (searchTerm.trim() !== '') {
          data = data.filter((guardian) =>
            guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardian.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardian.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardian.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guardian.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
  
        setGuardians(data);
      } catch (error) {
        console.error('Error fetching guardians:', error);
      }
    }, [searchTerm]); // searchTerm is added as a dependency to re-run this hook when the search term changes
  
    useEffect(() => {
      fetchGuardians();
    }, [fetchGuardians]);
  
    const fetchStudents =  useCallback(async () => {
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
        console.log('Error fetching students:', error);
      }
    }, []); // Empty dependency array because we only want to run this hook once
  
    useEffect(() => {
      fetchStudents();
    }, [fetchStudents]); // Empty dependency array because we only want to run this hook once
  
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
        
      setFormData((prevData) => ({ ...prevData, [name]: value }));
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
      if (cnicError || !formData.name || !formData.cnic || !formData.address || !formData.contactNumber || !formData.email) {
        setError('Please fill all the required fields.');
        return;
      }
      if(emailError){
        return;
      }
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
    <Container className="mt-5" style={{ height: '100vh', overflowY: 'auto' }}>
  <Form.Control
    type="text"
    placeholder="Search guardian by any credential"
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
          <Button variant="primary" onClick={handleModalShow}>
            Add Guardian
          </Button>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <GuardianList guardians={guardians} handleEdit={handleEdit} handleDelete={handleDelete} />
        </Col>
      </Row>
      <GuardianModal
        showModal={showModal}
        handleModalClose={handleModalClose}
        selectedGuardianId={selectedGuardianId}
        error={error}
        formData={formData}
        handleFormChange={handleFormChange}
        handleEmailBlur={handleEmailBlur}
        handleSelectChildren={handleSelectChildren}
        emailError={emailError}
        cnicError={cnicError}
        handleFormSubmit={handleFormSubmit}
        students={students}
      />
    </Container>
  );
};

export default GuardianContainer;
