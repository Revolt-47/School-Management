// StudentList.js
import React from 'react';
import { Button, Table } from 'react-bootstrap';

const StudentList = ({ students, handleEdit, handleDelete }) => (
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
              <Button variant="info" onClick={() => handleEdit(student._id)}>
                Edit
              </Button>{' '}
              <Button variant="danger" onClick={() => handleDelete(student._id)}>
                Delete
              </Button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7">No students found.</td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default StudentList;
