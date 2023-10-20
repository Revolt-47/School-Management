const mongoose = require('mongoose');

const rfidScannerSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolMOdel', // Assuming 'School' is the name of the school model
    required: true,
  },
  installationDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'In Repair'],
    default: 'Active',
  }
});

const RFIDScanner = mongoose.model('RFIDScanner', rfidScannerSchema);

module.exports = RFIDScanner;
