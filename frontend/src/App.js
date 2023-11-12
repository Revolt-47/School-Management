import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AllSchoolsScreen from './SuperAdminScreens/AllSchools';
import SuperAdminHomePage from './SuperAdminScreens/HomePage';
import SuperAdminLogin from './SuperAdminScreens/Login';
import SchoolDetailsScreen from './SuperAdminScreens/SchoolDetails';
import { BrowserRouter as Router } from 'react-router-dom';

const isAuthenticated = () => {
  // Check if the token is present and valid
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  return token !== undefined && token.split('=')[1] !== 'undefined'; // Check for a valid token
};

const AuthRoute = ({ element, ...rest }) => {
  return isAuthenticated() ? (
    // Render the component if authenticated
    element
  ) : (
    // Redirect to login if not authenticated
    <Navigate to="/" />
  );
};

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/superadmin/home" element={<AuthRoute element={<SuperAdminHomePage />} />} />
          <Route path="/superadmin/allschools" element={<AuthRoute element={<AllSchoolsScreen />} />} />
          <Route path="/superadmin/schooldetails/:id" element={<AuthRoute element={<SchoolDetailsScreen />} />} />
          <Route path="/" element={<SuperAdminLogin />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
