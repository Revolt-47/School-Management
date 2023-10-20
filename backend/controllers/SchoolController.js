const School = require('../models/SchoolModel'); // Adjust the path to your model file
const bcrypt = require('bcrypt'); // For password hashing
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating verification codes

async function registerSchool(req, res) {
  try {
    // Create a new school instance based on the request data
    const newSchool = new School({
      branchName: req.body.branchName,
      numberOfStudents: req.body.numberOfStudents,
      address: req.body.address,
      username: req.body.address,
      city: req.body.city,
      numberOfGates: req.body.numberOfGates,
      status: req.body.status || 'unverified', // Default to 'unverified' if status is not provided
    });

    // Generate a random verification code
    const verificationCode = crypto.randomBytes(6).toString('hex'); // 6-digit code

    // Encrypt the password before saving
    const saltRounds = 10; // Adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    newSchool.password = hashedPassword;
    newSchool.verificationCode = verificationCode;

    // Save the new school to the database
    const savedSchool = await newSchool.save();

    // Send the verification code to the school's email
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // e.g., 'Gmail'
      auth: {
        user: 'amirdaniyal47gmail.com',
        pass: process.env.EMAILPW,
      },
    });

    const mailOptions = {
      from: 'amirdaniyal47@email.com',
      to: req.body.email, // Assuming email is provided in the request body
      subject: 'Verification Code for School Registration',
      text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending the verification code.' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(201).json(savedSchool);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while registering the school.' });
  }
}



 async function verifyEmail(req,res){
  const { schoolId, verificationCode } = req.body;

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (school.status === 'verified') {
      return res.status(400).json({ error: 'School is already verified' });
    }

    if (school.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // If the verification code matches, change the status to 'verified'
    school.status = 'verified';
    await school.save();

    res.json({ message: 'School email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while verifying the email' });
  }
};

async function Login(req,res){

  const { username, password } = req.body;

  // Find the school by username
  const school = School.find((s) => s.username === username);

  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }

  // Check the password using bcrypt
  if (!bcrypt.compareSync(password, school.password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Generate a random verification code
  const verificationCode = crypto.randomBytes(6).toString('hex'); // 6-digit code

  // Send the verification code to the school's email
  const transporter = nodemailer.createTransport({
    service: 'YourEmailService', // e.g., 'Gmail'
    auth: {
      user: 'your@email.com',
      pass: 'yourpassword',
    },
  });

  const mailOptions = {
    from: 'your@email.com',
    to: school.email,
    subject: 'Verification Code for School Login',
    text: `Your verification code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while sending the verification code.' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Verification code sent to your email' });
    }
  });


}

async function verify(req, res){
  const { username, code } = req.body;

  // Find the school by username
  const school = School.find((s) => s.username === username);

  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }

  // Check if the entered code matches the generated code
  if (code !== school.verificationCode) {
    return res.status(401).json({ error: 'Invalid verification code' });
  }

  // If the code is correct, proceed with the login
  return res.status(200).json({ message: 'School logged in successfully' });
};

async function changeSchoolStatusById(schoolId, newStatus) {
  try {
    // Find the school by its ID
    const school = await School.findById(schoolId);

    if (!school) {
      return { success: false, message: 'School not found' };
    }

    // Check if the new status is one of the allowed values
    if (!['unverified', 'verified', 'active', 'inactive', 'blocked'].includes(newStatus)) {
      return { success: false, message: 'Invalid status value' };
    }

    // Update the school's status
    school.status = newStatus;
    await school.save();

    return { success: true, message: 'School status updated successfully' };
  } catch (error) {
    return { success: false, message: 'An error occurred while updating the school status' };
  }
}

async function getAllSchools() {
  try {
    const schools = await School.find();
    return schools;
  } catch (error) {
    throw new Error('An error occurred while fetching all schools');
  }
}

async function getSchoolsByStatus(status) {
  try {
    if (!['unverified', 'verified', 'active', 'inactive', 'blocked'].includes(status)) {
      throw new Error('Invalid status value');
    }

    const schools = await School.find({ status: status });
    return schools;
  } catch (error) {
    throw new Error('An error occurred while filtering schools by status');
  }
}

async function forgotPassword(req,res){

  const { username } = req.body;

  // Find the user by username or email
  const school = await School.findOne({ $or: [{ username }, { email: username }] });

  if (!school) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate a random reset code
  const resetCode = crypto.randomBytes(6).toString('hex'); // 6-digit code

  // Store the reset code and a timestamp in the user's profile
  school.resetCode = resetCode;
  school.resetCodeExpires = Date.now() + 36000; // Reset code expires in 6 minutes

  await school.save();

  // Send the reset code to the user's email
  const transporter = nodemailer.createTransport({
    service: 'YourEmailService', // e.g., 'Gmail'
    auth: {
      user: 'amirdaniyal47@email.com',
      pass: process.env.PORT,
    },
  });

  const mailOptions = {
    from: 'amirdaniyal47@email.com',
    to: school.email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${resetCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while sending the reset code.' });
    }

    res.status(200).json({ message: 'Password reset code sent to your email' });
  });

}

async function resetPassword(req,res){
  const { username, resetCode, newPassword } = req.body;

  // Find the user by username
  const school = await School.findOne({ username });

  if (!school) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if the reset code and timestamp are valid
  if (school.resetCode !== resetCode || school.resetCodeExpires < Date.now()) {
    return res.status(401).json({ error: 'Invalid or expired reset code' });
  }

  // Reset the user's password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  school.password = hashedPassword;

  // Clear the reset code and timestamp
  school.resetCode = null;
  school.resetCodeExpires = null;

  await school.save();

  res.status(200).json({ message: 'Password reset successful' });
}

async function updateTiming(req,res){
  const { schoolId, day, openTime, closeTime } = req.body;

  try {
    // Find the school by its ID
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check if the specified day exists in the timings array
    const dayIndex = school.timings.findIndex((timing) => timing.day === day);

    if (dayIndex === -1) {
      return res.status(400).json({ error: 'Invalid day' });
    }

    // Update the open and close times
    school.timings[dayIndex].openTime = openTime;
    school.timings[dayIndex].closeTime = closeTime;

    // Save the changes
    await school.save();

    return res.status(200).json({ message: 'Timings updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating timings' });
  }
}


module.exports = {
  registerSchool,verifyEmail,Login,verify,getAllSchools,getSchoolsByStatus,changeSchoolStatusById,forgotPassword,resetPassword,updateTiming
};
