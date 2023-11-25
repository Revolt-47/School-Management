const bcrypt = require('bcrypt');
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

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex');

    // Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Check if the driver already exists
    const existingDriver = await Driver.findOne({ cnic });

    if (existingDriver) {
      // If the driver already exists, add the vehicles to the driver's vehicles array
      if (vehicles && Array.isArray(vehicles)) {
        vehicles.forEach(async (vehicle) => {
          const { regNumber, company, modelName, type } = vehicle;
          if (!existingDriver.vehicles.some(v => v.regNumber === regNumber)) {
            existingDriver.vehicles.push({ regNumber, company, modelName, type });
          }
        });
        await existingDriver.save();
        res.status(200).json({ message: 'Vehicles added to an existing driver.' });
      } else {
        res.status(400).json({ error: 'Vehicles information is required in the request body.' });
      }
    } else {
      // If the driver doesn't exist, create a new driver
      const newDriver = new Driver({
        name,
        cnic,
        contactNumber,
        email,
        password: hashedPassword,
        school: schoolId, // Assuming schoolId is a valid ObjectId
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
        text: `Your credentials:\nContact Number: ${contactNumber}\nPassword: ${randomPassword} for VanDriver app`,
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to delete a driver by ID
const deleteDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Find and delete the driver by ID
    const deletedDriver = await Driver.findByIdAndDelete(driverId);

    if (!deletedDriver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    res.status(200).json({ message: 'Driver deleted successfully.' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update driver information
const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { contactNumber, email } = req.body;

    // Find the driver by ID
    const driverToUpdate = await Driver.findById(driverId);

    if (!driverToUpdate) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Update driver information
    if (contactNumber) {
      driverToUpdate.contactNumber = contactNumber;
    }

    if (email) {
      driverToUpdate.email = email;
    }

    // Save the updated driver to the database
    await driverToUpdate.save();

    res.status(200).json({ message: 'Driver updated successfully.', driver: driverToUpdate });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to add a vehicle to a driver
const addVehicleToDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { regNumber, company, modelName, type } = req.body;

    // Find the driver by ID
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Check if the vehicle already exists in the driver's vehicles array
    if (!driver.vehicles.some(v => v.regNumber === regNumber)) {
      // Add the vehicle to the driver's vehicles array
      driver.vehicles.push({ regNumber, company, modelName, type });

      // Save the updated driver to the database
      await driver.save();

      res.status(200).json({ message: 'Vehicle added to the driver successfully.' });
    } else {
      res.status(400).json({ error: 'Vehicle already associated with this driver.' });
    }
  } catch (error) {
    console.error('Error adding vehicle to driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to remove a vehicle from a driver
const removeVehicleFromDriver = async (req, res) => {
  try {
    const { driverId, regNumber } = req.params;

    // Find the driver by ID
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Check if the regNumber exists in the driver's vehicles array
    const vehicleToRemoveIndex = driver.vehicles.findIndex(vehicle => vehicle.regNumber === regNumber);

    if (vehicleToRemoveIndex === -1) {
      return res.status(400).json({ error: 'Vehicle not associated with this driver.' });
    }

    // Remove the vehicle from the driver's vehicles array
    driver.vehicles.splice(vehicleToRemoveIndex, 1);

    // Save the updated driver to the database
    await driver.save();

    res.status(200).json({ message: 'Vehicle removed from the driver successfully.' });
  } catch (error) {
    console.error('Error removing vehicle from driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the driver by email
    const driver = await Driver.findOne({ email });

    if (!driver) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, driver.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate a token (you may want to use a more secure approach in a production environment)
    const token = jwt.sign({ driverId: driver._id, role: 'driver' }, process.env.SECRET, { expiresIn: '72h' });

    res.status(200).json({ token });
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

const changePassword = async (req, res) => {
  try {
    const { driverId, oldPassword, newPassword } = req.body;

    // Find the driver by ID
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ error: 'driver not found.' });
    }

    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(oldPassword, driver.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the driver's password
    driver.password = hashedNewPassword;

    // Save the updated driver to the database
    await driver.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createDriverAccount,
  deleteDriverById,
  updateDriver,
  addVehicleToDriver,
  removeVehicleFromDriver,
  loginDriver,
  forgotPassword,
  resetPassword,
  changePassword
};