const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', 
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
  paymentType: {
    type: String,
    enum: ['Initial', 'Monthly'], // Add the two types of payments
    required: true,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
