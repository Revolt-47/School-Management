import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Collapse, Button } from "react-bootstrap";
import AdvStudentAttendance from "./AdvStudentAttendance";
import Cookies from "js-cookie";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function StudentDetails() {
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const token = Cookies.get("token");
  const school = JSON.parse(Cookies.get("school"));
  const schoolId = school._id;
  const navigate = useNavigate();

  const tableCellStyle = {
    padding: "8px",
    border: "1px solid black"
  };

  const tableStyle = {
    borderCollapse: "collapse",
    border: "2px solid black",
    width: "80%",
    boxShadow: "0px 0px 5px 2px rgba(0,0,0,0.5)",
    margin: "auto",
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/students/getdetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId: studentId }),
        });
        if (response.ok) {
          const studentData = await response.json();
          setStudent(studentData.std);
          console.log("Student details:", studentData);
        } else {
          console.error("Failed to fetch student details:", response.status);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudent();
  }, [studentId, token]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <ArrowBackIcon onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        <h2 style={{ marginLeft: '10px' }}>Student Details</h2>
      </div>
      {student ? (
        <div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={tableCellStyle}><strong>Name</strong></td>
                <td style={tableCellStyle}>{student.name}</td>
                <td style={tableCellStyle}><strong>Roll Number</strong></td>
                <td style={tableCellStyle}>{student.rollNumber}</td>
                <td style={tableCellStyle}><strong>CNIC</strong></td>
                <td style={tableCellStyle}>{student.cnic}</td>
              </tr>
              <tr>
                <td style={tableCellStyle}><strong>Class</strong></td>
                <td style={tableCellStyle}>{student.studentClass}</td>
                <td style={tableCellStyle}><strong>Section</strong></td>
                <td style={tableCellStyle}>{student.section}</td>
                <td style={tableCellStyle}><strong>RFID Tag</strong></td>
                <td style={tableCellStyle}>{student.rfidTag}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Button for toggling the advanced component */}
      <Button
        variant="primary"
        onClick={() => setOpenAdvanced(!openAdvanced)}
        aria-controls="adv-student-attendance"
        aria-expanded={openAdvanced}
      >
        {openAdvanced ? "Hide Advanced" : "Show Advanced"}
      </Button>

      
      {/* Advanced component with collapse effect */}
      <Collapse in={openAdvanced}>
        <div id="adv-student-attendance">
          <AdvStudentAttendance />
        </div>
      </Collapse>
    </div>
    
  );
}

export default StudentDetails;
