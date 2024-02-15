const School = require('../models/SchoolModel'); // Adjust the path to your model file
const bcrypt =  require('bcryptjs'); // For password hashing
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating verification codes
const cron = require('node-cron');
const jwt = require('jsonwebtoken')
const moment = require('moment');




async function registerSchool(req, res) {
  try {
    const schoolData = req.body;

    // Check if the school already exists in the database by its username or email
    const existingSchool = await School.findOne({ $or: [{ username: schoolData.username }, { email: schoolData.email }] });

    if (existingSchool) {
      // School is already registered, return an appropriate error message
      if (existingSchool.username === schoolData.username) {
        return res.status(200).json({ success: false, message: 'School registration failed. Username already in use.', status: 'error' });
      } else {
        return res.status(406).json({ success: false, message: 'School registration failed. Email already in use.', status: 'error' });
      }
    }

    // Create a new school instance based on the request data
    const newSchool = new School(schoolData);
  
    // Check if the password is present in the request body
    if (!schoolData.password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    // Encrypt the password before saving
    const saltRounds = 10; // Adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(schoolData.password.trim(), saltRounds);
    newSchool.password = hashedPassword;

    // Save the new school to the database
    const savedSchool = await newSchool.save();

    // Create a verification link with the school's ID
    const verificationLink = `http://localhost:3001/verify-email/${savedSchool._id}`; // frontend link

    // Send the verification link in the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amirdaniyal47@gmail.com',
        pass: 'zucq jdwo iqwp wttd',
      },
    });

    const mailOptions = {
      from: 'amirdaniyal47@email.com',
      to: req.body.email, // Assuming email is provided in the request body
      subject: 'Verification Link for School Registration',
      text: `Click on the following link to verify your registration: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending the verification link.' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(201).json("Check your email");
      }
    });

    res.status(201).json({ success: true, message: 'Registration successful. Check your email.', status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred while registering the school.', status: 'error' });
  }
}

async function verifyEmail(req, res) {
  const schoolId = req.params.schoolId; // Get school ID from request parameters

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (school.status === 'verified') {
      return res.status(400).json({ error: 'School is already verified' });
    }


    // If the verification code matches, change the status to 'verified'
    school.status = 'verified';
    await school.save();

    res.status(200).json({ message: 'School email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while verifying the email' });
  }
}


async function Login(req, res) {
  var { identifier, password } = req.body;
  identifier = identifier.trim();
  password = password.trim();

  try {


    const school = await School.findOne({ $or: [{ username: identifier }, { email: identifier }] });


    if (!school || school.status == 'unverified') {
      return res.status(404).json({ error: 'School not found' });
    }

    if (school.status == 'inactive') {
      return res.status(404).json({ error: 'School is inactive. Contact admin' });
    }

    if (school.status == 'blocked') {
      return res.status(404).json({ error: 'School is blocked by admin.' });
    }

    // Check the password using bcrypt
    if (!bcrypt.compareSync(password, school.password.trim())) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const payload = { schoolId: school._id.toString(), username: school.username, email: school.email, role: 'school' };
    console.log("Payload in token is : ");
    console.log(payload);
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '72h' });

    // Return the token along with a success message
    res.status(200).json({ message: 'Login successful', token, schoolId : school._id});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
}


async function forgotPassword(req, res) {
  const { email } = req.body;

  // Find the school by email
  const school = await School.findOne({ email });

  if (!school) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate a unique reset token
  const resetToken = crypto.randomBytes(16).toString('hex'); // You can adjust the token length

  // Calculate the expiration time for the reset link (10 minutes from now)
  const expirationTime = Date.now() + 600000; // 10 minutes in milliseconds

  // Include the reset token and expiration time in the reset link
  const resetLink = `http://localhost:3001/reset-password/${school._id}/${resetToken}/${expirationTime}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amirdaniyal47@gmail.com',
      pass: 'zucq jdwo iqwp wttd',
    },
  });

  const mailOptions = {
    from: 'amirdaniyal47@gmail.com',
    to: school.email,
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
  const { schoolId, resetToken, expirationTime, newPassword } = req.body;

  // Find the school by ID
  const school = await School.findById(schoolId);

  if (!school) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if the expiration time has passed (link is expired)
  if (expirationTime < Date.now()) {
    return res.status(401).json({ error: 'Reset link has expired' });
  }

  // Reset the user's password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  school.password = hashedPassword;

  await school.save();

  res.status(200).json({ message: 'Password reset successful' });
}



module.exports = {

  registerSchool,verifyEmail,Login,forgotPassword,resetPassword

};
