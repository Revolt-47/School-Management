import React, { useState, useRef } from 'react';
import { Button, Table } from 'react-bootstrap';
import AddGuardian from '../newGuardian/AddGuardian'; // Import the MainCompGuardian component

const StudentList = ({ students, handleEdit, handleDelete }) => {
    const [showModal, setShowModal] = useState(false); // State to control the modal visibility
    const studentId = useRef(null); // Ref to store the student ID
    const [formData, setFormData] = useState({
      name: '',
      cnic: '',
      address: '',
      contactNumber: '',
      email: '',
      relation: '',
      children: []
  });

  const handleStudentDetails = (id) => {
    console.log(id);
  }

  return (
      <>
          <Table striped bordered hover>
              <thead>
                  <tr>
                      <th>Name</th>
                      <th>CNIC</th>
                      <th>Roll Number</th>
                      <th>RFID Tag</th>
                      <th>Section</th>
                      <th>Class</th>
                      <th>Actions</th>
                      <th>Guardian Control</th>
                      <th>Danger</th>
                  </tr>
              </thead>
              <tbody>
                  {students && students.length > 0 ? (
                      students.map((student) => (
                          <tr key={student._id}>
                              <td>{student.name}</td>
                              <td>{student.cnic}</td>
                              <td>{student.rollNumber}</td>
                              <td>{student.rfidTag}</td>
                              <td>{student.section}</td>
                              <td>{student.studentClass}</td>
                              <td>
                                  <div style={{display:"flex", justifyContent:"space-evenly"}}>
                                      <Button variant="btn btn-success" onClick={() => handleStudentDetails(student._id)}>
                                          Details
                                      </Button>
                                      <Button variant="info" onClick={() => handleEdit(student._id)}>
                                          Edit
                                      </Button>
                                  </div>
                              </td>
                              <td>
                                  <Button variant="btn btn-secondary" onClick={() => {
                                      studentId.current = student._id;
                                      setShowModal(true)
                                  }}>
                                      Add Guardian
                                  </Button>
                                  {/* Pass necessary props to MainCompGuardian */}
                                  <AddGuardian studentId={studentId} showModal={showModal} setShowModal={setShowModal} setFormData={setFormData} formData={formData} />
                              </td>
                              <td>
                                  <Button variant="danger" onClick={() => handleDelete(student._id)}>
                                      Delete
                                  </Button>
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan="9">No students found.</td>
                      </tr>
                  )}
              </tbody>
          </Table>
      </>
  );
};

export default StudentList;
