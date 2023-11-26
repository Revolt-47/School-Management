const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  regNumber: {
    type: String,
    required: true,
    unique: true,
  },
  company: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', // Assuming you have a School model
    required: true,
  },
  vehicles: [vehicleSchema],
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
