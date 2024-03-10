import React, { useState } from "react";
import Student from "../components/Student/StudentContainer";
import { FaUserGraduate, FaUserShield, FaBus, FaThumbtack } from "react-icons/fa";
import Driver from "./Driver/Driver";

function Home() {
  const [activeTab, setActiveTab] = useState('student');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerPinned, setIsDrawerPinned] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (!isDrawerPinned) {
      setIsDrawerOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isDrawerPinned) {
      setIsDrawerOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDrawerPinned) {
      setIsDrawerOpen(false);
    }
  };

  const togglePin = () => {
    setIsDrawerPinned(!isDrawerPinned);
    setIsDrawerOpen(!isDrawerPinned);
  };

  const tabStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    boxShadow: '3px 3px 5px rgba(0, 0, 0, 0.3)',
    borderRadius: '5px',
    margin: '10px 0',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div 
        style={{ 
          width: isDrawerOpen ? '200px' : '0', 
          transition: 'width 0.5s', 
          overflow: 'hidden', 
          padding: '20px', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' 
        }} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
      >
        <div onClick={togglePin}>
          <FaThumbtack style={{ color: isDrawerPinned ? 'blue' : 'grey' }} />
        </div>
        <div onClick={() => handleTabClick('student')} style={tabStyle}>
          <FaUserGraduate /> Student
        </div>
        {/* <div onClick={() => handleTabClick('guardian')} style={tabStyle}>
          <FaUserShield /> Guardian
        </div> */}
        <div onClick={() => handleTabClick('driver')} style={tabStyle}>
          <FaBus /> Drivers
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {activeTab === 'student' && <Student />}
        {activeTab === 'driver' && <Driver />}
      </div>
    </div>
  );
}

export default Home;
