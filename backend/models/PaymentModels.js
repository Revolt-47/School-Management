const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolModel', // Assuming 'School' is the name of the school model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Card'], // Restrict to only 'Card' as the payment method
    required: true,
  },
  referenceNumber: {
    type: String,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
