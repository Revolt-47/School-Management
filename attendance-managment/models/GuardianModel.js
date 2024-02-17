const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  children: [{
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    relation: {
      type: String,
      enum: ['father', 'mother', 'guardian'],
      required: true,
    },
  }],
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
});

const Guardian = mongoose.model('Guardian', guardianSchema);

module.exports = Guardian;
