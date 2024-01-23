const express = require('express');
const paymentController = require('../controllers/PaymentController');
const router = express.Router();
const {VerifyRegistrationToken,VerifySchool} = require('../utils/Authenticate')
// Endpoint to create an initial payment
router.post('/initial-payment', paymentController.createInitialPayment);

// Endpoint to handle successful initial payment
router.post('/handle-successful-initial-payment', paymentController.handleSuccessfulInitialPayment);

// Endpoint to create a monthly subscription
router.post('/monthly-subscription', async (req, res) => {
  try {
    const { schoolId} = req.body;
    // Create a monthly subscription
    const subscription = await paymentController.createMonthlySubscription(schoolId);
    res.status(200).json({ message: 'Monthly subscription created successfully.', subscription });
  } catch (error) {
    console.error('Error creating monthly subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/pause-subscription',VerifyRegistrationToken,VerifySchool,paymentController.pauseSubscription);
router.post('/resume-subscription',VerifyRegistrationToken,VerifySchool,paymentController.resumeSubscription);


// Add more endpoints for other payment functions...

module.exports = router;
