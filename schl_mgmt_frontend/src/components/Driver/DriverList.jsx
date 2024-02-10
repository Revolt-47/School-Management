// DriverList.js
import React from 'react';
import { Button, Table } from 'react-bootstrap';

const DriverList = ({ drivers, handleEdit, handleDelete, handleDetails, handleAssign }) => (
  <div>
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>CNIC</th>
          <th>Contact Number</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {drivers && drivers.length > 0 ? (
          drivers.map((driver) => (
            <tr key={driver._id}>
              <td>{driver.name}</td>
              <td>{driver.cnic}</td>
              <td>{driver.contactNumber}</td>
              <td>{driver.email}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(driver._id)}>
                  Edit
                </Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(driver._id)}>
                  Delete
                </Button>{' '}
                <Button variant="success" onClick={() => handleDetails(driver._id)}>
                  Details
                </Button>{' '}
                <Button variant="primary" onClick={() => handleAssign(driver._id)}>
                  Assign
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No drivers found.</td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
);

export default DriverList;
