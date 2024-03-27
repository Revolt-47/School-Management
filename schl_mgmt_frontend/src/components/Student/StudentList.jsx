import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table} from 'react-bootstrap';
import Cookies from 'js-cookie';
import AddGuardian from '../newGuardian/AddGuardian'; // Import the MainCompGuardian component
import AttendanceModal from './AttendanceModal'; // Import the AttendanceModal component

const StudentList = ({ students, handleEdit }) => {
    const [showGuardianModal, setShowGuardianModal] = useState(false); // State to control the guardian modal visibility
    const [showAttendanceModal, setShowAttendanceModal] = useState(false); // State to control the attendance modal visibility
    const [attendance, setAttendance] = useState(null); // State to store attendance data
    const studentId = useRef(null); // Ref to store the student ID
    const navigate = useNavigate();
    const token = Cookies.get('token');
    const school = JSON.parse(Cookies.get('school'));
    const schoolId = school._id;
    const [formData, setFormData] = useState({
        name: '',
        cnic: '',
        address: '',
        contactNumber: '',
        email: '',
        relation: '',
        children: []
    });
    const selectedStudent = useRef(null);
    const handleStudentDetails = (student) => {
        navigate(`/studentDetails/${student._id}`);
    }

    const getCheckInOut = async (student) => {
        selectedStudent.current = student;
        try {
            const response = await fetch('http://localhost:3000/attendance/getCheckinCheckout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId: student._id,
                    date: new Date().toISOString().split('T')[0], // Today's date
                    schoolId,
                }),
            });
            const data = await response.json();
            // console.log('CheckIns:', checkIns.current);
            // console.log('CheckOuts:', checkOuts.current);
            setAttendance({ checkIns: data.checkIns, checkOuts: data.checkOuts });
            //console.log('Attendance From List:', attendance.checkIns[0]);
            setShowAttendanceModal(true); // Show the attendance modal after fetching data
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    }

    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>CNIC</th>
                        <th>Roll Number</th>
                        <th>RFID Tag</th>
                        <th>Section</th>
                        <th>Class</th>
                        <th>Actions</th>
                        <th>Guardian Control</th>
                        <th>Attendance</th>
                    </tr>
                </thead>
                <tbody>
                    {students && students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student._id}>
                                <td>{student.name}</td>
                                <td>{student.cnic}</td>
                                <td>{student.rollNumber}</td>
                                <td>{student.rfidTag}</td>
                                <td>{student.section}</td>
                                <td>{student.studentClass}</td>
                                <td>
                                    <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                                        <Button variant="btn btn-success" onClick={() => handleStudentDetails(student)}>
                                            Details
                                        </Button>
                                        <Button variant="info" onClick={() => handleEdit(student._id)}>
                                            Edit
                                        </Button>
                                    </div>
                                </td>
                                <td>
                                    <Button variant="btn btn-secondary" onClick={() => {
                                        studentId.current = student._id;
                                        setShowGuardianModal(true)
                                    }}>
                                        Add Guardian
                                    </Button>
                                    {/* Pass necessary props to MainCompGuardian */}
                                    <AddGuardian studentId={studentId} showModal={showGuardianModal} setShowModal={setShowGuardianModal} setFormData={setFormData} formData={formData} />
                                </td>
                                <td>
                                    <Button variant="btn btn-primary" onClick={() => getCheckInOut(student)}>Attendance</Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No students found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            {/* Attendance modal */}
            <AttendanceModal show={showAttendanceModal} handleClose={() => setShowAttendanceModal(false)} attendance={attendance} selectedStudent={selectedStudent.current} />
        </>
    );
};

export default StudentList;
