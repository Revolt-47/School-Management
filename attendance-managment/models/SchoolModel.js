const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({

  username: {
    type: String,
    unique: true,
  },
  branchName: {
    type: String,
    required: true,
  },
  numberOfStudents: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
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
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  timings: [
    {
      day: {
        type: String,
        required: true,
      },
      openTime: {
        type: Date,
        required: true,
      },
      closeTime: {
        type: Date,
        required: true,
      },
    },
  ],
  classes:[
    {
      class:{
        type:String,
        require : true
      },
      section:{
        type:String,
        required: true,
      }
    }
  ]
});

const School = mongoose.model('School', schoolSchema);

module.exports = School;