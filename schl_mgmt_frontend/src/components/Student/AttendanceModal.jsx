import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import moment from 'moment'; // Import moment library for date handling
import Cookies from 'js-cookie';

const AttendanceModal = ({ show, handleClose, attendance, selectedStudent }) => {
    const school = JSON.parse(Cookies.get('school'));
    const schoolId = school._id;
    
    const handleManualCheckIn = async () => {
        try {
            console.log(selectedStudent);
            // Fetch necessary data for manual check-in
            const rfidTag = selectedStudent.rfidTag; // Get RFID tag of selected student
            const time = moment().format('HH:mm:ss'); // Get current time in 'HH:mm:ss' format
            const date = moment().toISOString(); // Get current date in ISO format

            // Make API call for manual check-in
            const response = await fetch('http://localhost:3000/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rfidTag, time, date, schoolId }),
            });
            const data = await response.json();

            // Handle response accordingly
            if (response.ok) {
                alert('Manual check-in successful');
                handleClose();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error performing manual check-in:', error);
            alert('Failed to perform manual check-in');
        }
    };

    useEffect(() => {   
        console.log("Attendance:", attendance);
    }, [attendance]);


    const handleManualCheckOut = async () => {
        try {
            // Fetch necessary data for manual check-out
            const rfidTag = selectedStudent.rfidTag; // Get RFID tag of selected student
            const time = moment().format('HH:mm:ss'); // Get current time in 'HH:mm:ss' format
            const date = moment().toISOString(); // Get current date in ISO format
    
            // Make API call for manual check-out
            const response = await fetch('http://localhost:3000/attendance/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rfidTag, time, date, schoolId }),
            });
            const data = await response.json();
    
            // Handle response accordingly
            if (response.ok) {
                alert('Manual check-out successful');
                handleClose();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error performing manual check-out:', error);
            alert('Failed to perform manual check-out');
        }
    };
    

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Attendance Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {attendance && (
                    <div>
                        {attendance.checkIns.length > 0 ? (
                            <p><strong>Check-In:</strong> {moment(attendance.checkIns[0].time, 'HH:mm:ss').format('hh:mm A')}</p>
                        ) : (
                            <p><strong>Check-In:</strong> Student didn't check in today.</p>
                        )}
                        {attendance.checkOuts.length > 0 ? (
                            <p><strong>Check-Out:</strong> {moment(attendance.checkOuts[0].time, 'HH:mm:ss').format('hh:mm A')}</p>
                        ) : (
                            <p><strong>Check-Out:</strong> Student didn't check out today.</p>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                    <div>
                        <Button variant="primary" onClick={handleManualCheckIn}>Manual Check-In</Button>
                        <Button variant="danger" onClick={handleManualCheckOut}>Manual Check-Out</Button>
                    </div>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AttendanceModal;
