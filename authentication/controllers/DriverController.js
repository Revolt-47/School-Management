const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Driver = require('../models/DriverModel');
const jwt = require('jsonwebtoken');

const createDriverAccount = async (req, res) => {
  try {
    const {
      name,
      cnic,
      contactNumber,
      email,
      schoolId, // Assuming schoolId is provided in the request body
      vehicles, // Assuming vehicles is an array of objects with regNumber, company, modelName, and type
    } = req.body;
    console.log(req.body);
    console.log(req.body.vehicles);
    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex');

    // Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Check if the driver already exists
    const existingDriver = await Driver.findOne({ cnic });

    if (existingDriver) {
      // If the driver already exists, add the school to the driver's schools array if it doesn't exist
      if (!existingDriver.schools.includes(schoolId)) {
        existingDriver.schools.push(schoolId);
        await existingDriver.save();
      }

      // Add the vehicles to the driver's vehicles array
      if (vehicles && Array.isArray(vehicles)) {
        vehicles.forEach(async (vehicle) => {
          const { regNumber, company, modelName, type } = vehicle;
          if (!existingDriver.vehicles.some(v => v.regNumber === regNumber)) {
            existingDriver.vehicles.push({ regNumber, company, modelName, type });
          }
        });
        await existingDriver.save();
      }

      res.status(200).json({ message: 'Vehicles added to an existing driver.' });
    } else {
      // If the driver doesn't exist, create a new driver
      const newDriver = new Driver({
        name,
        cnic,
        contactNumber,
        email,
        password: hashedPassword,
        schools: [schoolId], // Assuming schoolId is a valid ObjectId
        vehicles: vehicles || [], // Create an array with the vehicles if provided
      });

      // Save the new driver to the database
      await newDriver.save();

      // Send credentials over email using Node Mailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'amirdaniyal47@gmail.com', // Replace with your Gmail email
          pass: process.env.EMAILPW, // Replace with your Gmail password
        },
      });

      const mailOptions = {
        from: 'amirdaniyal47@gmail.com',
        to: email,
        subject: 'Your Credentials',
        text: `Your credentials:\nContact Number: ${email}\nPassword: ${randomPassword} for VanDriver app`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({ message: 'Driver account created successfully.' });
        }
      });
    }
  } catch (error) {
    console.error('Error creating driver account:', error);
    res.status(500).json(error);
  }
};



const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the driver by email
    const driver = await Driver.findOne({ email });

    if (!driver) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, driver.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a token (you may want to use a more secure approach in a production environment)
    const token = jwt.sign({ driverId: driver._id, role: 'driver' }, process.env.SECRET, { expiresIn: '72h' });

    // Return the driver ID along with the token
    res.status(200).json({ driverId: driver._id, token });
  } catch (error) {
    console.error('Error logging in driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


async function forgotPassword(req, res) {
  const { email } = req.body;

  // Find the driver by email
  const driver = await Driver.findOne({ email });

  if (!driver) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate a unique reset token
  const resetToken = crypto.randomBytes(16).toString('hex'); // You can adjust the token length

  // Calculate the expiration time for the reset link (10 minutes from now)
  const expirationTime = Date.now() + 600000; // 10 minutes in milliseconds

  // Include the reset token and expiration time in the reset link
  const resetLink = `http://localhost:3000/reset-password/${driver._id}/${resetToken}/${expirationTime}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amirdaniyal47@gmail.com',
      pass: process.env.EMAILPW,
    },
  });

  const mailOptions = {
    from: 'amirdaniyal47@gmail.com',
    to: driver.email,
    subject: 'Password Reset Link',
    text: `Click on the following link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while sending the reset link.' });
    }

    res.status(200).json({ message: 'Password reset link sent to your email' });
  });
}

async function resetPassword(req, res) {
  const { driverId, resetToken, expirationTime, newPassword } = req.body;

  // Find the driver by ID
  const driver = await Driver.findById(driverId);

  if (!driver) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if the expiration time has passed (link is expired)
  if (expirationTime < Date.now()) {
    return res.status(401).json({ error: 'Reset link has expired' });
  }

  // Reset the user's password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  driver.password = hashedPassword;

  await driver.save();

  res.status(200).json({ message: 'Password reset successful' });
}




module.exports = {
  createDriverAccount,
  loginDriver,
  forgotPassword,
  resetPassword,
};