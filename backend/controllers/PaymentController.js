const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const School = require('../models/SchoolModel');
const Payment = require('../models/PaymentModels');
const Student = require('../models/StudentModel');
const cron = require('node-cron');

const calculateInitialAmount = async (numGates) => {
  // Calculate the initial amount based on the number of gates
  const gateAmount = numGates * 10000000; // Assuming 100,000 PKR per gate
  const fixedAmount = 5000000; // Fixed amount of 50,000 PKR
  return (gateAmount + fixedAmount);
};

const calculateMonthlySubscriptionAmount = async (schoolId) => {
    try {
      // Calculate the monthly subscription amount based on the number of students
      const numStudents = await Student.countDocuments({ school: schoolId });
      return numStudents * 1000000; // Assuming 1,000 PKR per student 
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
      paymentMethod : 'Card',
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
        id: school._id,
        name: school.username
      });
    } else {
      // If the customer exists, get the first customer from the list
      customer = customer.data[0];
    }

    // Create a PaymentIntent with the customer ID
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
     setup_future_usage: 'off_session',

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
    const { schoolId } = req.body;

    // Check if the school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }

    const existingInitialPayment = await Payment.findOne({
      school: school._id,
      paymentType: 'Initial',
    });

    console.log(existingInitialPayment)
    if (existingInitialPayment) {
      // If an initial payment already exists, return its client secret
      return res.status(200).json({ clientSecret: null });
    }

    // Calculate the initial amount
    const amount = await calculateInitialAmount(school.numberOfGates);
    console.log(amount)
    // Create a payment intent with Stripe
    const paymentIntent = await createPaymentIntent(amount, 'pkr', schoolId);
    console.log(paymentIntent)

    // Return client secret to confirm the payment on the client side
    res.status(200).json({ clientSecret: paymentIntent.client_secret, customerId: paymentIntent.customer, amount: amount });
  } catch (error) {
    console.error('Error creating initial payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const handleSuccessfulInitialPayment = async (req, res) => {
  try {
    const { schoolId, numGates, paymentMethod} = req.body;

    // Check if the school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }

    amount = await calculateInitialAmount(school.numberOfGates)

    // Handle the successful payment
    const payment = await handleSuccessfulPayment(schoolId, amount, paymentMethod,'1234', 'Initial');

  
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
        limit: 2,
      });
  
      if (customer.data.length === 0) {
        // If the customer doesn't exist, create a new customer in Stripe
        customer = await stripe.customers.create({
          email: school.email,
          // Add additional information if needed
        });
      } else {
        // If the customer exists, get the first customer from the list
        customer = customer.data[1];
      }
  
      // Log the number of students for debugging
      console.log('Number of students:', school.numberOfStudents);
  
      // Calculate the monthly subscription amount

      console.log(customer)
      const amount = await calculateMonthlySubscriptionAmount(schoolId);
  
      const subscription = await stripe.subscriptions.create({
              customer: `${customer.id}`,
               items: [
                    { price: 'price_1OahV2EdXzoBMsb8T80xVVYz',
                      // quantity: school.numberOfStudents,
                      
    },
  ],
  payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method  : 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
});
recordusage(subscription,school.numberOfStudents);
saveSubscriptionDetails(school._id,amount,subscription)
return subscription;
      
    } catch (error) {
      console.error('Error creating monthly subscription:', error);
      throw error;
    }
  };

  const recordusage = async (subscription, students) => {
    try {
      // Create the usage record with the current time
      await stripe.subscriptionItems.createUsageRecord(
        subscription.items.data[0].id,
        {
          quantity: students,
          timestamp: 'now', // Use 'now' to indicate the current time
          action: 'increment',
        }
      );
  
      console.log('Usage record created successfully.');
    } catch (error) {
      console.error('Error creating usage record:', error);
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
        referenceNumber : subscription.items.data[0].id
      });
  
      // Save the document
      await payment.save();
    } catch (error) {
      console.error('Error saving subscription details:', error);
      throw error;
    }
  };

  cron.schedule('0 0 */24 * * *', async () => {
    try {
      // Retrieve saved subscriptions from MongoDB
      const savedSubscriptions = await Payment.find({
        paymentType: 'Monthly',
      });
  
      // Iterate over each saved subscription and record usage
      for (const savedSubscription of savedSubscriptions) {
        await recordUsageForSavedSubscription(savedSubscription);
      }
  
      console.log('Usage recording task completed successfully.');
    } catch (error) {
      console.error('Error in usage recording task:', error);
    }
  });
  
  // Function to record usage for a saved subscription
const recordUsageForSavedSubscription = async (savedSubscription) => {
  try {

    // Retrieve the school associated with the subscription
    const school = await School.findById(savedSubscription.school);

    if (!school) {
      console.error(`School not found for subscription ${savedSubscription.referenceNumber}`);
      return;
    }

    // Fetch the number of students from the school model
    const numberOfStudents = school.numberOfStudents;

    // Record usage for the subscription
    await stripe.subscriptionItems.createUsageRecord(savedSubscription.referenceNumber, {
      quantity: numberOfStudents,
      timestamp: 'now',
      action: 'increment',
    });

    console.log(`Usage recorded for subscription ${savedSubscription.referenceNumber}`);
  } catch (error) {
    console.error(`Error recording usage for subscription ${savedSubscription.referenceNumber}:`, error);
  }
};

const pauseSubscription = async (req, res) => {
  const { schoolId } = req.body;

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'No school found.' });
    }

    const customer = await stripe.customers.list({
      email: school.email,
      limit: 1,
    });

    if (customer.data.length === 0) {
      return res.status(404).json({ error: 'No customer found for the school email.' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.data[0].id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found for the school.' });
    }

    const subscription = subscriptions.data[0];

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        pause_collection: {
          behavior: 'void',
        },
      }
    );

    school.status = 'inactive';
    school.save();

    return res.status(200).json({ message: 'Subscription paused successfully.', subscription: updatedSubscription });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resumeSubscription = async (req, res) => {
  const { schoolId } = req.body;

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'No school found.' });
    }

    const customer = await stripe.customers.list({
      email: school.email,
      limit: 1,
    });

    if (customer.data.length === 0) {
      return res.status(404).json({ error: 'No customer found for the school email.' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.data[0].id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found for the school.' });
    }

    const subscription = subscriptions.data[0];

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        pause_collection: {
          behavior: '',
        },
      }
    );

    school.status = 'active';
    school.save();

    return res.status(200).json({ message: 'Subscription resumed successfully.', subscription: updatedSubscription });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  createInitialPayment,
  handleSuccessfulInitialPayment,
  createMonthlySubscription,
  pauseSubscription,
  resumeSubscription
};