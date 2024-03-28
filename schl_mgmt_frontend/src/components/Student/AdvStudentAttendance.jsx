import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment"; 
import Cookies from "js-cookie";

function AdvStudentAttendance({ setShowAdvanced }) {
    const { studentId } = useParams();
    const token = Cookies.get("token");
    const school = JSON.parse(Cookies.get("school"));
    const schoolId = school._id;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isButtonClicked, setIsButtonClicked] = useState(false); // State to track button click
    const naivgate = useNavigate();

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleDeleteChild = async (studentId) => {
        try {
            if(window.confirm("Are you sure you want to delete this student?")) {
            const token = Cookies.get('token');
            await fetch(`http://localhost:3000/students/delete/${studentId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
        
            alert('Student deleted successfully');
            naivgate('/home');
        }
          } catch (error) {
            console.error('Error deleting student:', error);
          }
    };
    
    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/attendance/getAttendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        studentId,
                        startDate,
                        endDate,
                        schoolId
                    }),
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch attendance data');
                }
    
                const data = await response.json();
                setAttendanceData(data.attendance);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching attendance:', error);
                setError('Failed to fetch attendance data');
                setLoading(false);
            }
        };
    
        if (startDate && endDate) {
            fetchAttendance();
        }
    }, [startDate, endDate, studentId, token, schoolId]); // Added fetchAttendance to the dependency array
    

    const handleCheckInOut = async (date, index) => {
        try {
            console.log("Fetching check-in and check-out data for date:", date);
            const response = await fetch('http://localhost:3000/attendance/getCheckinCheckout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId,
                    date,
                    schoolId,
                    role:"",
                    pickupPerson:""
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch check-in and check-out data');
            }
            const data = await response.json();
            console.log("Check-in and check-out data for date", date, ":", data);
    
            // Convert check-in and check-out times to 12-hour format
            const checkInTime = moment(data.checkIns[0]?.time, 'HH:mm:ss').format('hh:mm A');
            const checkOutTime = moment(data.checkOuts[0]?.time, 'HH:mm:ss').format('hh:mm A');
            console.log("Check out object:", data.checkOuts[0]);
            // Update the attendanceData state with check-in and check-out data for the specific row
            setAttendanceData(prevAttendanceData => {
                const newData = [...prevAttendanceData];
                newData[index] = { ...newData[index], checkIn: checkInTime, checkOut: checkOutTime };
                return newData;
            });
    
            // Remove the error if any, since the fetch is successful
            setError(null);
        } catch (error) {
            console.error('Error fetching check-in and check-out:', error);
            setError('Failed to fetch check-in and check-out data');
        }
    };
        



    return (
        <div className="container text-center">
            <h2>Attendance Search</h2>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="input-group mb-3">
                        <span className="input-group-text">Start Date:</span>
                        <input type="date" className="form-control" value={startDate} onChange={handleStartDateChange} />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="input-group mb-3">
                        <span className="input-group-text">End Date:</span>
                        <input type="date" className="form-control" value={endDate} onChange={handleEndDateChange} />
                    </div>
                </div>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : !startDate || !endDate ? (
                <p>Please select both start date and end date.</p>
            ) : (
                <div>
                    <div className="table-responsive">
                        {attendanceData.length === 0 ? (
                            <p>No attendance records found for the selected date range.</p>
                        ) : (
                            <table className="table table-striped" style={{ border: "1px solid black" }}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Check-In / Check-Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {attendanceData.map((attendance, index) => {
    return (
        <tr key={index}>
            <td>{new Date(attendance.date).toLocaleDateString()}</td>
            <td>{attendance.status}</td>
            <td>
                <button className="btn btn-primary" onClick={() => { handleCheckInOut(attendance.date, index); setIsButtonClicked(index); }}>Check-In / Check-Out</button>
                {isButtonClicked === index && (
                    <>
                        <p>Check-In: {attendance.checkIn}</p>
                        <p>Check-Out: {attendance.checkOut}</p>
                    </>
                )}
            </td>
        </tr>
    );
})}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
            <div className="border border-danger p-3 mt-4 d-flex justify-content-between align-items-center">
                <h4 className="text-danger mb-0">Danger</h4>
                <button className="btn btn-danger" onClick={() => handleDeleteChild(studentId)}>Remove Child</button>
            </div>
        </div>
    );

}

export default AdvStudentAttendance;
