// SearchBar.js
import React from 'react';
import { Form } from 'react-bootstrap';

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <Form.Control
    type="text"
    placeholder="Search guardian by any credential"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      width: '50%',
      display: 'block',
      margin: '0 auto',
    }}
  />
);

export default SearchBar;
