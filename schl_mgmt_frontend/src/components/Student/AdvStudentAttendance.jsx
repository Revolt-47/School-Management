import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };
    const handleCloseAdvanced = () => {
        setShowAdvanced(false);
    };
    useEffect(() => {
        if (startDate && endDate) {
            fetchAttendance();
        }
    }, [startDate, endDate]);

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

    return (
        <div className="container text-center">
            <h2>Advanced Search</h2>
            <button className="btn btn-danger" onClick={handleCloseAdvanced} style={{ float: 'right' }}>Close</button>
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
                <div className="table-responsive">
                    {attendanceData.length === 0 ? (
                        <p>No attendance records found for the selected date range.</p>
                    ) : (
                        <table className="table table-striped" style={{border:"1px solid black"}}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((attendance, index) => (
                                    <tr key={index}>
                                        <td>{new Date(attendance.date).toLocaleDateString()}</td>
                                        <td>{attendance.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdvStudentAttendance;