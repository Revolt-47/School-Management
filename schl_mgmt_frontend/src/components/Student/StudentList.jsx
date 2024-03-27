import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal } from 'react-bootstrap';
import Cookies from 'js-cookie';
import AddGuardian from '../newGuardian/AddGuardian'; // Import the MainCompGuardian component

// Modal component for displaying student attendance
// Modal component for displaying student attendance
const AttendanceModal = ({ show, handleClose, attendance }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Attendance Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {attendance && (
                    <div>
                        {attendance.checkIns.length > 0 ? (
                            <p><strong>Check-In:</strong> {attendance.checkIns[0]}</p>
                        ) : (
                            <p><strong>Check-In:</strong> Student didn't check in today.</p>
                        )}
                        {attendance.checkOuts.length > 0 ? (
                            <p><strong>Check-Out:</strong> {attendance.checkOuts[0]}</p>
                        ) : (
                            <p><strong>Check-Out:</strong> Student didn't check out today.</p>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

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

    const handleStudentDetails = (student) => {
        navigate(`/studentDetails/${student._id}`);
    }

    const getCheckInOut = async (studentId) => {
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
            const data = await response.json();
            // console.log('CheckIns:', checkIns.current);
            // console.log('CheckOuts:', checkOuts.current);
            setAttendance({ checkIns: data.checkIns, checkOuts: data.checkOuts });
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
                                    <Button variant="btn btn-primary" onClick={() => getCheckInOut(student._id)}>Attendance</Button>
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
            <AttendanceModal show={showAttendanceModal} handleClose={() => setShowAttendanceModal(false)} attendance={attendance} />
        </>
    );
};

export default StudentList;
