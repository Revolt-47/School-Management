import React from 'react';
import { Card } from 'react-bootstrap';

const StudentCountBox = ({ totalStudents }) => {
  return (
    <div style={{ position: 'sticky', right: '10px', top: '10px', zIndex: '1000', width: '150px' }}>
      <Card bg="light" className="rounded p-2">
        <h5 className="text-center mb-2">Students</h5>
        <div className="text-center">
          <p><strong>Total:</strong> {totalStudents}</p>
        </div>
      </Card>
    </div>
  );
}

export default StudentCountBox;
