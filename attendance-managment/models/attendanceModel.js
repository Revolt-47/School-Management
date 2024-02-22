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
        type: Number,
        min: 0,
        max: 6,
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
