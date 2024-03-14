// GuardianModal.js
import React from 'react';
import { Modal } from 'react-bootstrap';
import GuardianForm from './GuardianForm';

const GuardianModal = ({ showModal, handleModalClose, selectedGuardianId, error, formData, handleFormChange, handleEmailBlur, handleSelectChildren, emailError, cnicError, handleFormSubmit, students }) => (
  <Modal show={showModal} onHide={handleModalClose}>
    <Modal.Header closeButton>
      <Modal.Title>{selectedGuardianId ? 'Edit Guardian' : 'Add Guardian'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <GuardianForm
        formData={formData}
        handleFormChange={handleFormChange}
        handleEmailBlur={handleEmailBlur}
        handleSelectChildren={handleSelectChildren}
        emailError={emailError}
        cnicError={cnicError}
        error={error}
        students={students}
        handleFormSubmit={handleFormSubmit}
      />
    </Modal.Body>
  </Modal>
);

export default GuardianModal;
