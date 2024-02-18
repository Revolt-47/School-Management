const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkInSchema = new Schema({
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    time: {
      type: Date,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  });

module.exports = {
    checkInSchema
}