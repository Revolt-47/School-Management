const CheckIn = require('../models/checkInModel');
const Student = require('../models/StudentModel');
const Checkout = require('../models/checkOutModel'); 
const Attendance = require('../models/attendanceModel');
const School = require('../models/SchoolModel');
const moment = require('moment');
const Guardian = require('../models/GuardianModel')
const Driver = require('../models/DriverModel')

const axios = require('axios');

const moment_timezone = require('moment-timezone');


let checkoutQueue = [];

// Function to add to the checkout queue
async function addToQueue(req, res) {
    try {
        const { role, id, studentId, schoolId,time } = req.body;
        let relation = null;
        let date = req.body.date;
        date = moment.tz(date, 'YYYY-MM-DD', 'America/New_York');
        console.log(date)

        
        // Populate student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(426).json({ success: false, message: 'Student not found' });
        }

          let existingCheckIn = await CheckIn.findOne({ student: student._id, date: date });
           if (!existingCheckIn) {
            return res.status(426).json({ success: false, message: 'Student did not check in today' });
        }

        // Check the role
        if (role.toLowerCase() === 'driver') {
            // If the role is a driver, find the driver by ID
            const driver = await Driver.findById(id);
            if (!driver) {
                return res.status(404).json({ success: false, message: 'Driver not found' });
            }
            relation = 'driver';
        } else if (role.toLowerCase() === 'guardian') {
            // If the role is a guardian, find the guardian by ID
            const guardian = await Guardian.findById(id);
            if (!guardian) {
                return res.status(404).json({ success: false, message: 'Guardian not found' });
            }

            // Find the child's relation with the guardian
            const childRelation = guardian.children.find(child => child.child.toString() === studentId);
            if (childRelation) {
                relation = childRelation.relation;
            } else {
                return res.status(404).json({ success: false, message: 'Relation not found for the student and guardian' });
            }
        }
        let exisiting = null;
        exisiting = checkoutQueue.find(item => item.student._id.toString() === studentId.toString());
        // Add to the queue

        if(exisiting == null){
        checkoutQueue.push({ role, id, student, schoolId, relation });
        await sendCallNotification(id,student,role,id,date,time);
        const guardians = await Guardian.find({
            children: { $elemMatch: { child: student._id, relation: { $in: ['father', 'mother'] } } }
        });

        for (const guardian of guardians) {
            await sendCallNotification(guardian._id,student,role,id,date,time);
        }
        
    }


        return res.status(201).json({ success: true, message: 'Added to queue successfully' });
    } catch (error) {
        console.error('Error adding to queue:', error);
        return res.status(500).json({ success: false, message: 'Failed to add to queue' });
    }
}
// Function to check-in a student
async function checkInStudent(req, res) {
    try {

        const { rfidTag, time, date,schoolId} = req.body; // Assuming these fields are sent in the request body
        // Find the student by RFID tag
        const student = await Student.findOne({ rfidTag });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Find the open time of the school for the specified date
        const specificDate = moment.tz(date, 'YYYY-MM-DD', 'America/New_York');
        const dayOfWeek = specificDate.format('dddd'); // Get the day of the week as a string
        const school = await School.findById(schoolId);
        if (!school) {
            
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        if(student.school != schoolId){
            return res.status(404).json({ success: false, message: 'Student not registered in this school' });
        }
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

        // Check if a check-in entry already exists for the student on the specific date
        let existingCheckIn = await CheckIn.findOne({ student: student._id, date: specificDate });
        if (existingCheckIn) {
            // Update the existing check-in entry
            res.status(489).json("Child already checked in for today")
        } else {
            // Create a new check-in entry
            existingCheckIn = new CheckIn({
                school: schoolId,
                student: student._id,
                time: time,
                date: specificDate,
            });
            await existingCheckIn.save();
        }

        // Create or update attendance record for the student
        let attendance = await Attendance.findOne({ student_id: student._id, date: specificDate });
        if (attendance) {
            // Update the existing attendance record
            res.status(489).json("Child already checked in for today")

        } else {
            // Create a new attendance record
            attendance = new Attendance({
                school_id: schoolId,
                student_id: student._id,
                date: specificDate,
                day: specificDate.day(), // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
                status: isLate ? 'Late' : 'Present'
            });
            await attendance.save();
        }

        const guardians = await Guardian.find({
            children: { $elemMatch: { child: student._id, relation: { $in: ['father', 'mother'] } } }
        });

        for (const guardian of guardians) {
            await sendCheckInNotification(guardian._id, time, date,student.name);
        }
        return res.status(201).json({ success: true, message: 'Student checked in successfully' });
    } catch (error) {
        console.error('Error checking in student:', error);
        return res.status(500).json({ success: false, message: 'Failed to check in student' });
    }

}
// Function to checkout a student
async function checkoutStudent(req, res) {
    try {
        const { rfidTag, time, date , pickupPerson , role,schoolId} = req.body;
        // const { schoolId } = req.decoded;
        
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

        if(student.school != school._id){
            return res.status(404).json({ success: false, message: 'Student not registered in this school' });
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

        const existingCheckout = await Checkout.findOne({ student: student._id, date: date });
        if (existingCheckout) {
            return res.status(400).json({ success: false, message: 'Student has already checked out' });
        }

        const existingCheckin = await CheckIn.findOne({ student: student._id, date: date });
        if (!existingCheckin) {
            return res.status(400).json({ success: false, message: 'Student did not checked in today' });
        }

        // Create a new checkout entry
        const checkout = new Checkout({
            school: schoolId, // Assuming schoolId is decoded from JWT
            student: student._id, // Save the student ID in the checkout entry
            time : time,
            date: Date(date),
            pickupPerson,
            role,
        });

        // Save the checkout entry to the database
        await checkout.save();
        // Remove the student from the queue
        checkoutQueue = checkoutQueue.filter(item => item.student._id.toString() !== student._id.toString());

        // Update the attendance status to 'Early' if the student is leaving early
        const attendance = await Attendance.findOneAndUpdate(
            { school_id: schoolId, student_id: student._id, date: Date(date) },
            { status: isEarly ? 'Early Leave' : 'Present' },
            { new: true }
        );

        const guardians = await Guardian.find({
            children: { $elemMatch: { child: student._id, relation: { $in: ['father', 'mother'] } } }
        });

        for (const guardian of guardians) {
            await sendCheckOutNotification(guardian._id, time, date,student.name,role,pickupPerson);
        }

        if(pickupPerson){
            await sendCheckOutNotification(pickupPerson, time, date,student.name,role,pickupPerson);
        }

        return res.status(200).json({ success: true, message: 'Student checked out successfully', pickupPerson });
    } catch (error) {
        console.error('Error checking out student:', error);
        return res.status(500).json({ success: false, message: 'Failed to check out student' });
    }
}
// Function to get check-ins and check-outs of a student of a school for a specific day
async function getStudentCheckInCheckoutForDay(req, res) {
    try {
        const { studentId, date, schoolId } = req.body;
        // const { schoolId } = req.decoded;
        // Find check-ins and check-outs for the specified student and school for the given day
        const startDate = new Date(date); // Start of the day
        const endDate = new Date(date); // End of the day
        endDate.setDate(endDate.getDate() + 1); // Increment the date to the next day
        console.log(startDate,endDate)

// Find check-ins and check-outs for the specified student and school for the given day
        const checkIns = await CheckIn.find({ student: studentId, school: schoolId, date: { $gte: startDate, $lt: endDate } });
        const checkOuts = await Checkout.find({ student: studentId, school: schoolId, date: { $gte: startDate, $lt: endDate } });

        return res.status(200).json({ success: true, checkIns, checkOuts });
    } catch (error) {
        console.error('Error getting check-ins and check-outs for a student for a day:', error);
        return res.status(500).json({ success: false, message: 'Failed to get check-ins and check-outs for a student for a day' });
    }
}
async function updateOrCreateAttendance(req, res) {
    try {
        let { date, schoolId } = req.body;
        date = moment.tz(date, 'YYYY-MM-DD', 'America/New_York');

        // Find all check-ins for the specified date
        const checkIns = await CheckIn.find({ school: schoolId, date: date });

        // Get the student IDs from the check-ins
        const studentIds = checkIns.map(checkIn => String(checkIn.student));

        // Find all students in the school
        const students = await Student.find({ school: schoolId });

        // Create or update attendance records for each student
        const attendancePromises = students.map(async (student) => {
            const studentIdString = String(student._id);

            // Check if an attendance record already exists for the student and date
            const existingAttendance = await Attendance.findOne({
                school_id: schoolId,
                student_id: student._id,
                date: date
            });

            if (!studentIds.includes(studentIdString)) {
                // If the student didn't check in, and there is no existing attendance record
                if (!existingAttendance) {
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
            } else {
                // If the student checked in, and there is no existing attendance record
                if (!existingAttendance) {
                    // Create new attendance record as present
                    const newAttendance = new Attendance({
                        school_id: schoolId,
                        student_id: student._id,
                        date,
                        day: new Date(date).getDay(),
                        status: 'Present'
                    });
                    await newAttendance.save();
                    const guardians = await Guardian.find({
                        children: { $elemMatch: { child: student._id, relation: { $in: ['father', 'mother'] } } }
                    });
            
                    for (const guardian of guardians) {
                        await sendAbsentNotification(guardian._id,student.name,date);
                    }
                }
            }
        });

        // Execute all attendance creation/update promises
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
        let { studentId, startDate, endDate,schoolId } = req.body; // Assuming studentId, startDate, and endDate are sent from the frontend

        startDate = moment.tz(startDate, 'YYYY-MM-DD', 'America/New_York');
        endDate = moment.tz(endDate, 'YYYY-MM-DD', 'America/New_York');
        // Find attendance records for the specified student within the given date range
        const attendance = await Attendance.find({ student_id: studentId,school_id:schoolId, date: { $gte: startDate, $lte: endDate } });

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error('Error getting student attendance:', error);
        return res.status(500).json({ success: false, message: 'Failed to get student attendance' });
    }
}
async function getAttendanceofaClass(req, res) {
    try {
        let { studentClass, section, date, schoolId } = req.body;

        date =  moment.tz(date, 'YYYY-MM-DD', 'America/New_York');

        // Find all students of the specified class, section, and school
        const students = await Student.find({ school: schoolId, section: section, studentClass: studentClass });
        
        // Initialize an empty array to store attendance data for each student
        const attendanceData = [];

        // Loop through each student to get their attendance for the specified date
        for (const student of students) {
            // Find the attendance record for the student on the specified date
            const attendance = await Attendance.findOne({ school_id: schoolId, student_id: student._id, date: date });
            // Push the attendance data for the student to the array
            attendanceData.push({ student: student, attendance: attendance });
        }

        return res.status(200).json({ success: true, attendanceData: attendanceData });
    } catch (error) {
        console.error('Error getting attendance for a class:', error);
        return res.status(500).json({ success: false, message: 'Failed to get attendance for a class' });
    }
}
// Function to get queue elements of a particular school
function getQueueBySchoolId(req,res) {
    const {schoolId} = req.body
    console.log(checkoutQueue.length)

    const queueBySchool = checkoutQueue.filter(item => item.schoolId.toString() === schoolId.toString());
    if (queueBySchool.length != 0){
        res.status(200).json(queueBySchool)
    }
    else{

        console.log('Empty Queue')
        res.status(404).json({message: 'No calls in queue'})
    }
}

async function sendCheckInNotification(subID, time,date,child) {
    try {
      const requestBody = {
        subID: subID,
        appId: 19959,
        appToken: "tOGmciFdfRxvdPDp3MiotN",
        title: "Your child checked in ",
        message: `${child} checked in school at ${time} on ${date}`,
      };
  
      // Adjust time logic here if needed
      // For example, you might want to set a specific time in the requestBody
  
      const response = await axios.post('https://app.nativenotify.com/api/indie/notification', requestBody);
      
      // Assuming the API returns some data, you can handle it here if needed
      console.log(response.data);
  
      return response.data; // Return any data you need from the response
    } catch (error) {
      console.error('Error sending notification:', error.response ? error.response.data : error.message);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }

async function sendCheckOutNotification(subID, time, date, child, role, person) {
    try {
        let message;
        if (role && person) {
            // Fetch pickup person details based on role and person ID
            let pickupPersonName = '';
            if (role.toLowerCase() === 'driver') {
                // Fetch driver details based on person ID
                const driver = await Driver.findById(person);
                if (driver) {
                    pickupPersonName = driver.name;
                }
            } else if (role.toLowerCase() === 'guardian') {
                // Fetch guardian details based on person ID
                const guardian = await Guardian.findById(person);
                if (guardian) {
                    pickupPersonName = guardian.name;
                }
            }
            message = `${child} checked out of school at ${time} on ${date} by ${role} ${pickupPersonName}.`;
        } else {
            message = `${child} checked out of school at ${time} on ${date} by himself.`;
        }

        const requestBody = {
            subID: subID,
            appId: 19959,
            appToken: "tOGmciFdfRxvdPDp3MiotN",
            title: "Your child checked out",
            message: message,
        };

        // Adjust time logic here if needed
        // For example, you might want to set a specific time in the requestBody

        const response = await axios.post('https://app.nativenotify.com/api/indie/notification', requestBody);

        // Assuming the API returns some data, you can handle it here if needed
        console.log(response.data);

        return response.data; // Return any data you need from the response
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

async function sendCallNotification(subID, child, role, person,date,time) {
    try {
        let message;
        if (role && person) {
            // Fetch pickup person details based on role and person ID
            let pickupPersonName = '';
            if (role.toLowerCase() === 'driver') {
                // Fetch driver details based on person ID
                const driver = await Driver.findById(person);
                if (driver) {
                    pickupPersonName = driver.name;
                }
            } else if (role.toLowerCase() === 'guardian') {
                // Fetch guardian details based on person ID
                const guardian = await Guardian.findById(person);
                if (guardian) {
                    pickupPersonName = guardian.name;
                }
            }
            message = `${child.name} called out of school by ${role} ${pickupPersonName} at ${time} on ${date}.`;
        } else {
            res.status(400).error("Empty role or id");
        }

        const requestBody = {
            subID: subID,
            appId: 19959,
            appToken: "tOGmciFdfRxvdPDp3MiotN",
            title: "Your child was called !",
            message: message,
        };

        // Adjust time logic here if needed
        // For example, you might want to set a specific time in the requestBody

        const response = await axios.post('https://app.nativenotify.com/api/indie/notification', requestBody);

        // Assuming the API returns some data, you can handle it here if needed
        console.log(response.data);

        return response.data; // Return any data you need from the response
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

async function sendAbsentNotification(subID,child,date) {
    try {
      const requestBody = {
        subID: subID,
        appId: 19959,
        appToken: "tOGmciFdfRxvdPDp3MiotN",
        title: "Your child checked in ",
        message: `${child} didnot checked in school  on ${date}`,
      };
  
      // Adjust time logic here if needed
      // For example, you might want to set a specific time in the requestBody
  
      const response = await axios.post('https://app.nativenotify.com/api/indie/notification', requestBody);
      
      // Assuming the API returns some data, you can handle it here if needed
      console.log(response.data);
  
      return response.data; // Return any data you need from the response
    } catch (error) {
      console.error('Error sending notification:', error.response ? error.response.data : error.message);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }


module.exports = { checkInStudent,addToQueue,
                    checkoutStudent,
                    getStudentAttendance,
                    updateOrCreateAttendance,
                    getStudentCheckInCheckoutForDay,
                    getAttendanceofaClass,
                    getQueueBySchoolId };
