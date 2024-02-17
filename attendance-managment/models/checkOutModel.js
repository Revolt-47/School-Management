const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkoutSchema = new Schema({
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
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    pickupPerson: {
      type: Schema.Types.Mixed, // Allows storing either ObjectId or String
      required: true
    }
  });

module.exports = {checkoutSchema}