import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import AdvStudentAttendance from './AdvStudentAttendance';

function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState({ checkIns: [], checkOuts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false); // State to manage advanced attendance component visibility
  const token = Cookies.get('token');
  const school = JSON.parse(Cookies.get('school'));
  const schoolId = school._id;
  const { studentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    console.log('Fetching attendance for student ID:', studentId);
    try {
      const response = await fetch('http://localhost:3000/attendance/getCheckinCheckout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          date: new Date().toISOString().split('T')[0], // Today's date
          schoolId,
        }),
      });

      console.log('Response:', response);

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      console.log('Attendance data:', data);
      setAttendanceData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance data');
      setLoading(false);
    }
  };

  // Define inline styles
  const attendanceContainerStyle = {
    textAlign: 'center',
  };

  const tableContainerStyle = {
    margin: 'auto',
    maxWidth: '600px', // Adjust width as needed
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd', // Change border color if needed
    borderRadius: '15px',
    boxShadow: '0px 0px 5px 2px rgba(0, 0, 0, 0.1)',
  };

  const thStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd', // Change border color if needed
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd', // Change border color if needed
  };

  const todayHeaderStyle = {
    backgroundColor: '#f2f2f2', // Light gray background color for "Today" header row
  };

  return (
    <div style={{height:"100vh"}}>
      <h2>Attendance</h2>
    <div style={attendanceContainerStyle}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={todayHeaderStyle}>
                  <th colSpan="2" style={thStyle}>Today</th>
                </tr>
                <tr>
                  <th style={thStyle}>Check-In</th>
                  <th style={thStyle}>Check-Out</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.checkIns.length === 0 && attendanceData.checkOuts.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={tdStyle}>N/A</td>
                  </tr>
                ) : (
                  attendanceData.checkIns.map((checkIn, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>{checkIn.time ? checkIn.time : 'N/A'}</td>
                      <td style={tdStyle}>{attendanceData.checkOuts[index]?.time ? attendanceData.checkOuts[index].time : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
  <button className="btn btn-primary mt-3" onClick={() => navigate(`/home`)}>
    Back
  </button>
  <button
    className="btn btn-primary mt-3"
    onClick={() => setShowAdvanced(!showAdvanced)}
  >
    Advanced
  </button>
</div>

          {showAdvanced && <AdvStudentAttendance setShowAdvanced={setShowAdvanced} />}
        </div>
      )}
    </div>
    </div>
  );
}

export default StudentAttendance;
