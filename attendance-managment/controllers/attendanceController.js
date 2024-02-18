const CheckIn = require('../models/checkInModel');
const Student = require('../models/StudentModel');
const Checkout = require('../models/checkoutModel'); 
const Attendance = require('../models/attendanceModel');
const School = require('../model/SchoolModel');
const moment = require('moment');


let checkoutQueue = [];

// Function to add to the checkout queue
async function addToQueue(req, res) {
    try {
        const { role, id, studentId } = req.body;

        // Populate student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Add to the queue
        checkoutQueue.addToQueue({ role, id, student });

        return res.status(201).json({ success: true, message: 'Added to queue successfully' });
    } catch (error) {
        console.error('Error adding to queue:', error);
        return res.status(500).json({ success: false, message: 'Failed to add to queue' });
    }
}

// Function to check-in a student
async function checkInStudent(req, res) {
    try {
        const { rfidTag, time, date } = req.body; // Assuming these fields are sent in the request body
        const { schoolId } = req.decoded;

        // Find the student by RFID tag
        const student = await Student.findOne({ rfidTag });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Find the open time of the school for the specified date
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        // Get the day of the week
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        // Find the timings for the specified day of the week
        const timings = school.timings.find(timing => timing.day === dayOfWeek);
        if (!timings) {
            return res.status(404).json({ success: false, message: `Timings not found for ${dayOfWeek}` });
        }

        // Convert open time to minutes for comparison
        const openTimeMinutes = timings.openTime.getHours() * 60 + timings.openTime.getMinutes();

        // Convert check-in time to minutes for comparison
        const checkInTimeMinutes = new Date(time).getHours() * 60 + new Date(time).getMinutes();

        // Check if the student is late
        const isLate = checkInTimeMinutes > openTimeMinutes;

        // Create a new check-in entry
        const checkIn = new CheckIn({
            school: schoolId,
            student: student._id, // Save the student ID in the check-in entry
            time:moment(time, 'hh:mm A').toDate(),
            date: Date(date),
        });

        // Save the check-in entry to the database
        await checkIn.save();

        // Create or update attendance record for the student
        const attendance = new Attendance({
            school_id: schoolId,
            student_id: student._id,
            date: Date(date),
            day: new Date(date).getDay(),
            status: isLate ? 'Late' : 'Present' // Mark as 'Late' if the student is late, otherwise mark as 'Present'
        });
        await attendance.save();

        return res.status(201).json({ success: true, message: 'Student checked in successfully' });
    } catch (error) {
        console.error('Error checking in student:', error);
        return res.status(500).json({ success: false, message: 'Failed to check in student' });
    }
}

// Function to checkout a student
async function checkoutStudent(req, res) {
    try {
        const { rfidTag, time, date } = req.body;
        const { schoolId } = req.decoded;
        
        // Find the student by RFID tag
        const student = await Student.findOne({ rfidTag });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        // Find the open and close time of the school for the specified date
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        // Get the day of the week
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        // Find the timings for the specified day of the week
        const timings = school.timings.find(timing => timing.day === dayOfWeek);
        if (!timings) {
            return res.status(404).json({ success: false, message: `Timings not found for ${dayOfWeek}` });
        }

        // Convert close time to minutes for comparison
        const closeTimeMinutes = timings.closeTime.getHours() * 60 + timings.closeTime.getMinutes();

        // Convert check-out time to minutes for comparison
        const checkoutTimeMinutes = new Date(time).getHours() * 60 + new Date(time).getMinutes();

        // Check if the student is leaving early
        const isEarly = checkoutTimeMinutes < closeTimeMinutes;

        // Retrieve pickup person from the queue
        let pickupPerson = checkoutQueue.find(item => item.studentId === student._id);
        if (!pickupPerson) {
            pickupPerson = null;
        }

        // Remove pickup person from the queue
        const index = checkoutQueue.indexOf(pickupPerson);
        checkoutQueue.splice(index, 1);

        // Create a new checkout entry
        const checkout = new Checkout({
            school: schoolId, // Assuming schoolId is decoded from JWT
            student: student._id, // Save the student ID in the checkout entry
            time : moment(time, 'hh:mm A').toDate(),
            date: Date(date),
            pickupPerson
        });

        // Save the checkout entry to the database
        await checkout.save();

        // Update the attendance status to 'Early' if the student is leaving early
        const attendance = await Attendance.findOneAndUpdate(
            { school_id: schoolId, student_id: student._id, date: Date(date) },
            { status: isEarly ? 'Early Leave' : 'Present' },
            { new: true }
        );

        return res.status(200).json({ success: true, message: 'Student checked out successfully', pickupPerson });
    } catch (error) {
        console.error('Error checking out student:', error);
        return res.status(500).json({ success: false, message: 'Failed to check out student' });
    }
}


// Function to get check-ins and check-outs of a student of a school for a specific day
async function getStudentCheckInCheckoutForDay(req, res) {
    try {
        const { studentId, schoolId, date } = req.body;

        // Find check-ins and check-outs for the specified student and school for the given day
        const checkIns = await CheckIn.find({ student: studentId, school: schoolId, date: { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) } });
        const checkOuts = await Checkout.find({ student: studentId, school: schoolId, date: { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) } });

        return res.status(200).json({ success: true, checkIns, checkOuts });
    } catch (error) {
        console.error('Error getting check-ins and check-outs for a student for a day:', error);
        return res.status(500).json({ success: false, message: 'Failed to get check-ins and check-outs for a student for a day' });
    }
}

async function updateOrCreateAttendance(req, res) {
    try {
        const { date } = req.body; // Assuming date is sent from the frontend
        const { schoolId } = req.decoded;

        // Find all check-ins for the specified date
        const checkIns = await CheckIn.find({ school: schoolId, date: { $gte: date, $lt: new Date(date).setDate(new Date(date).getDate() + 1) } });

        // Get the student IDs from the check-ins
        const studentIds = checkIns.map(checkIn => checkIn.student);

        // Find all students in the school
        const students = await Student.find({ school: schoolId });

        // Create new attendance records for each student with 'Absent' status if they didn't check in
        const attendancePromises = students.map(async (student) => {
            if (!studentIds.includes(student._id)) { // If the student didn't check in
                // Create new attendance record as absent
                const newAttendance = new Attendance({
                    school_id: schoolId,
                    student_id: student._id,
                    date,
                    day: new Date(date).getDay(),
                    status: 'Absent'
                });
                await newAttendance.save();
            }
        });

        // Execute all attendance creation promises
        await Promise.all(attendancePromises);

        return res.status(200).json({ success: true, message: 'Attendance updated/created successfully' });
    } catch (error) {
        console.error('Error updating/creating attendance:', error);
        return res.status(500).json({ success: false, message: 'Failed to update/create attendance' });
    }
}

// Controller function to get attendance of a student
async function getStudentAttendance(req, res) {
    try {
        const { studentId, startDate, endDate } = req.body; // Assuming studentId, startDate, and endDate are sent from the frontend

        // Find attendance records for the specified student within the given date range
        const attendance = await Attendance.find({ student_id: studentId, date: { $gte: startDate, $lte: endDate } });

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error('Error getting student attendance:', error);
        return res.status(500).json({ success: false, message: 'Failed to get student attendance' });
    }
}



module.exports = { checkInStudent,addToQueue,
                    checkoutStudent,
                    getStudentAttendance,
                    updateOrCreateAttendance,
                    getStudentCheckInCheckoutForDay };
