// GuardianTableRow.js
import React from 'react';
import { Button } from 'react-bootstrap';

const GuardianTableRow = ({ guardian, handleEdit, handleDelete }) => (
  <tr key={guardian._id}>
    <td>{guardian.name}</td>
    <td>{guardian.cnic}</td>
    <td>{guardian.address}</td>
    <td>{guardian.contactNumber}</td>
    <td>{guardian.email}</td>
    <td>{guardian.children.length}</td>
    <td>
      <Button variant="info" onClick={() => handleEdit(guardian._id)}>
        Edit
      </Button>{' '}
      <Button variant="danger" onClick={() => handleDelete(guardian._id)}>
        Delete
      </Button>
    </td>
  </tr>
);

export default GuardianTableRow;
