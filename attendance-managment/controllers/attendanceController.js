const CheckIn = require('../models/checkInModel');
const Student = require('../models/StudentModel');
const Checkout = require('../models/checkoutModel'); // Assuming this is your checkout model


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

        // Create a new check-in entry
        const checkIn = new CheckIn({
            school: schoolId,
            student: student._id, // Save the student ID in the check-in entry
            time,
            date
        });

        // Save the check-in entry to the database
        await checkIn.save();

        return res.status(201).json({ success: true, message: 'Student checked in successfully' });
    } catch (error) {
        console.error('Error checking in student:', error);
        return res.status(500).json({ success: false, message: 'Failed to check in student' });
    }
}

// Function to checkout a student
async function checkoutStudent(req, res) {
    try {
        const { rfidTag } = req.body;

        // Find the student by RFID tag
        const student = await Student.findOne({ rfidTag });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Retrieve pickup person from the queue
        const pickupPerson = checkoutQueue.find(item => item.studentId === student._id);
        if (!pickupPerson) {
            return res.status(404).json({ success: false, message: 'Pickup person not found in the queue' });
        }

        // Remove pickup person from the queue
        const index = checkoutQueue.indexOf(pickupPerson);
        checkoutQueue.splice(index, 1);

        // Create a new checkout entry
        const checkout = new Checkout({
            school: req.decoded.schoolId, // Assuming schoolId is decoded from JWT
            student: student._id, // Save the student ID in the checkout entry
            time: new Date().toISOString(), // Example: current time in ISO string format
            pickupPerson
        });

        // Save the checkout entry to the database
        await checkout.save();

        return res.status(200).json({ success: true, message: 'Student checked out successfully', pickupPerson });
    } catch (error) {
        console.error('Error checking out student:', error);
        return res.status(500).json({ success: false, message: 'Failed to check out student' });
    }
}


module.exports = { checkInStudent,addToQueue,
                    checkoutStudent };
