import React from 'react';
import { Card } from 'react-bootstrap';
import { BiUser } from 'react-icons/bi';

const StudentCountBox = ({ totalStudents }) => {
  return (
    <div className="mt-3 mb-3 text-center">
      <Card bg="light" className="rounded p-2" style={{ marginRight:"60px", width: '200px', border: '1px solid black', boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <div className="d-flex align-items-center mb-2">
          <BiUser size={30} color="#007bff" className="mr-2" />
          <h5 className="mb-0">Students</h5>
        </div>
        <div className="text-center">
          <p><strong>Total:</strong> {totalStudents}</p>
        </div>
      </Card>
    </div>
  );
}

export default StudentCountBox;
