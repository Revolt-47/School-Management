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
    },
    pickupPerson: {
      type: Schema.Types.Mixed, // Allows storing either ObjectId or String
      required: false,
      default : null
    },
    role:{
      type: String,
    }
  });

  const CheckOut = mongoose.model('CheckOut', checkoutSchema);

  module.exports = CheckOut;