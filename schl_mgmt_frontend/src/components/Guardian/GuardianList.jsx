// GuardianList.js
import React from 'react';
import { Table, Button } from 'react-bootstrap';

const GuardianList = ({ guardians, handleEdit, handleDelete }) => (
<Table striped bordered hover>
    <thead>
      <tr>
        <th>Name</th>
        <th>CNIC</th>
        <th>Address</th>
        <th>Contact Number</th>
        <th>Email</th>
        <th>Children</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {guardians && guardians.length > 0 ? (
        guardians.map((guardian) => (
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
        ))
      ) : (
        <tr>
          <td colSpan="7">No guardians found.</td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default GuardianList;