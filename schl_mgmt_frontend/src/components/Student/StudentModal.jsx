// StudentModal.js
import React from 'react';
import { Modal,Alert } from 'react-bootstrap';
import StudentForm from './StudentForm';

const StudentModal = ({ showModal, handleModalClose, selectedStudentId, error, formData, handleFormChange, cnicError, handleFormSubmit }) => (
  <Modal show={showModal} onHide={handleModalClose}>
    <Modal.Header closeButton>
      <Modal.Title>{selectedStudentId ? 'Edit Student' : 'Add Student'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <StudentForm formData={formData} handleFormChange={handleFormChange} cnicError={cnicError} handleFormSubmit={handleFormSubmit} />
    </Modal.Body>
  </Modal>
);

export default StudentModal;
