const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const School = require('../models/SchoolModel');
const Payment = require('../models/PaymentModels');
const Student = require('../models/StudentModel')

const calculateInitialAmount = async (numGates) => {
  // Calculate the initial amount based on the number of gates
  const gateAmount = numGates * 100000; // Assuming 100,000 PKR per gate
  const fixedAmount = 50000; // Fixed amount of 50,000 PKR
  return gateAmount + fixedAmount;
};

const calculateMonthlySubscriptionAmount = async (schoolId) => {
    try {
      // Calculate the monthly subscription amount based on the number of students
      const numStudents = await Student.countDocuments({ school: schoolId });
      return numStudents * 1000; // Assuming 1,000 PKR per student
    } catch (error) {
      console.error('Error calculating monthly subscription amount:', error);
      throw error;
    }
  };


const handleSuccessfulPayment = async (schoolId, amount, paymentMethod, referenceNumber, paymentType) => {
  console.log(schoolId)
  try {
    const payment = new Payment({
      school: schoolId,
      amount,
      paymentDate: new Date(),
      paymentMethod,
      referenceNumber,
      paymentType,
    });

    await payment.save();

    return payment;
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
};

const createPaymentIntent = async (amount, currency, schoolId) => {
  try {
    const school = await School.findById(schoolId);

    if (!school) {
      console.error('School not found for ID:', schoolId);
      throw new Error('School not found');
    }

    // Check if the customer (school) exists in Stripe
    let customer = await stripe.customers.list({
      email: school.email,
      limit: 1,
    });

    if (customer.data.length === 0) {
      // If the customer doesn't exist, create a new customer in Stripe
      customer = await stripe.customers.create({
        email: school.email,
        // Add additional information if needed
      });
    } else {
      // If the customer exists, get the first customer from the list
      customer = customer.data[0];
    }

    // Create a PaymentIntent with the customer ID
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    throw error;
  }
};





const createInitialPayment = async (req, res) => {
  try {
    const { schoolId} = req.body;

    // Check if the school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }

    const existingInitialPayment = await Payment.findOne({
      school: school._id,
      paymentType: 'Initial',
    });

    if (existingInitialPayment) {
      // If an initial payment already exists, return its client secret
      return res.status(200).json({ clientSecret: existingInitialPayment.clientSecret });
    }

    // Calculate the initial amount
    const amount = await calculateInitialAmount(school.numberOfGates);
    console.log(amount)

    // Create a payment intent with Stripe
    const paymentIntent = await createPaymentIntent(amount, 'pkr',schoolId);

    // Return client secret to confirm the payment on the client side
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating initial payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const handleSuccessfulInitialPayment = async (req, res) => {
  try {
    const { schoolId, numGates, paymentMethod, referenceNumber } = req.body;


    // Check if the school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }

    // Calculate the initial amount
    const amount = await calculateInitialAmount(school.numberOfGates);

    // Handle the successful payment
    const payment = await handleSuccessfulPayment(schoolId, amount, paymentMethod, referenceNumber, 'Initial');

    res.status(201).json({ message: 'Initial payment created successfully.', payment });
  } catch (error) {
    console.error('Error handling successful initial payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createMonthlySubscription = async (schoolId) => {
    try {
      const school = await School.findById(schoolId);
  
      if (!school) {
        console.error('School not found for ID:', schoolId);
        throw new Error('School not found');
      }
  
      // Check if the customer (school) exists in Stripe
      let customer = await stripe.customers.list({
        email: school.email,
        limit: 1,
      });
  
      if (customer.data.length === 0) {
        // If the customer doesn't exist, create a new customer in Stripe
        customer = await stripe.customers.create({
          email: school.email,
          // Add additional information if needed
        });
      } else {
        // If the customer exists, get the first customer from the list
        customer = customer.data[0];
      }
  
      // Log the number of students for debugging
      console.log('Number of students:', school.numberOfStudents);
  
      // Calculate the monthly subscription amount
      const amount = await calculateMonthlySubscriptionAmount(schoolId);
  
      // Create a subscription with Stripe
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1OGcTREdXzoBMsb84RQP40hb', // Replace with your actual Stripe product price ID
            quantity: school.numberOfStudents,
          },
        ],
        payment_behavior: 'default_incomplete',
        billing_cycle_anchor: Math.floor(Date.now() / 1000) + 3600 * 24 * 30, // Start the subscription a week from now
      });
  
      // Return the created subscription
      return subscription;
    } catch (error) {
      console.error('Error creating monthly subscription:', error);
      throw error;
    }
  };
  
  
  // Helper function to save subscription details in MongoDB
  const saveSubscriptionDetails = async (schoolId, amount, subscription) => {
    try {
  
      // Create a new Payment document
      const payment = new Payment({
        school: schoolId,
        amount: amount,
        paymentMethod: 'Card', // Assuming it's a card payment
        paymentType: 'Monthly',
      });
  
      // Save the document
      await payment.save();
    } catch (error) {
      console.error('Error saving subscription details:', error);
      throw error;
    }
  };
  


module.exports = {
  createInitialPayment,
  handleSuccessfulInitialPayment,
  createMonthlySubscription,

};