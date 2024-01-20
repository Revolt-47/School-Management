import React, { useState } from "react";
import Student from "./Student";
import Guardian from "./Guardian";
import { FaUserGraduate, FaUserShield, FaBus } from "react-icons/fa";
import Driver from "./Driver";

const containerStyle = {
  display: 'flex',
  height: '100vh', // Make it full-screen
  fontFamily: 'Arial, sans-serif',
};

const tabsContainerStyle = {
  width: '200px', // Set a fixed width for the side panel
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const contentContainerStyle = {
  flex: 1, // Fill the remaining space
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const tabStyle = {
  padding: '10px',
  cursor: 'pointer',
  borderBottom: '2px solid #ccc',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'border-color 0.3s, color 0.3s',
};

const activeTabStyle = {
  fontWeight: 'bold',
  borderBottomColor: '#3498db',
  color: '#3498db',
  background: '#fff',
};

const iconSize = {
  fontSize: '1.2em',
};

function Home() {
  const [activeTab, setActiveTab] = useState('student');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        <div>
          <div
            style={{ ...tabStyle, ...activeTab === 'student' && activeTabStyle }}
            onClick={() => handleTabClick('student')}
          >
            <FaUserGraduate style={iconSize} /> Student
          </div>
          <div
            style={{ ...tabStyle, ...activeTab === 'guardian' && activeTabStyle }}
            onClick={() => handleTabClick('guardian')}
          >
            <FaUserShield style={iconSize} /> Guardian
          </div>
          <div
            style={{ ...tabStyle, ...activeTab === 'driver' && activeTabStyle }}
            onClick={() => handleTabClick('driver')}
          >
            <FaBus style={iconSize} /> Drivers
          </div>
          </div>
      </div>
      <div style={contentContainerStyle}>
        {activeTab === 'student' && <Student />}
        {activeTab === 'guardian' && <Guardian />}
        {activeTab === 'driver' && <Driver />}
      </div>
    </div>
  );
}

export default Home;
