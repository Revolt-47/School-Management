const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Early Leave'],
        required: true
    }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
