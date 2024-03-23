import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentAttendance from "./StudentAttendance";
import Cookies from "js-cookie";

function StudentDetails() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const token = Cookies.get("token");
  const school = JSON.parse(Cookies.get("school"));
  const schoolId = school._id;

  // Define style object
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
          body: JSON.stringify({ studentId: studentId }), // Send studentId as part of a JSON object
        });
        if (response.ok) {
          const studentData = await response.json();
          setStudent(studentData.std);
          console.log("Student details:", studentData);
        } else {
          // Handle error response
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
      {student ? (
        <div>
          <h2>Student Details</h2>
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
      <StudentAttendance/>
    </div>
  );
}

export default StudentDetails;
