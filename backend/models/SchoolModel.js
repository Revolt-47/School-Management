const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
  },
  branchName: {
    type: String,
    required: true,
  },
  numberOfStudents: {
    type: Number,
    required: true,
  },
  address: {
    type: String, // We can store the Google Maps location as a string
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  numberOfGates: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "unverified",
    enum: ["unverified", "verified", "active", "inactive", "blocked"],
  },
  email : {
    type: String,
    required: true,
    unique : true,
  },
  password : {
    type: String,
    required: true,
  },
  timings: [
    {
      day: {
        type: String, // E.g., "Monday"
        required: true,
      },
      openTime: {
        type: Date, // Store open time as a Date object
        required: true,
      },
      closeTime: {
        type: Date, // Store close time as a Date object
        required: true,
      },
    },

  ],
});

const School = mongoose.model('School', schoolSchema);

module.exports = School;