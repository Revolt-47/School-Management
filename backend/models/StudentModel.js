const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  rfidTag: {
    type: String,
    unique: true,
  },
  section: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', 
    required: true,
  },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
