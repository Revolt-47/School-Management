const School = require('../models/SchoolModel'); // Adjust the path to your model file
const bcrypt = require('bcrypt'); // For password hashing
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating verification codes
const cron = require('node-cron');
const jwt = require('jsonwebtoken')
const moment = require('moment');




async function registerSchool(req, res) {
  try {
    // Check if the school already exists in the database by its email
    const existingSchool = await School.findOne({ email: req.body.email });

    if (existingSchool) {
      // School is already registered, return its status
      return res.status(200).json({ message: 'School already registered', status: existingSchool.status });
    }

    // Create a new school instance based on the request data
    const newSchool = new School({
      branchName: req.body.branchName,
      numberOfStudents: req.body.numberOfStudents,
      address: req.body.address,
      username: req.body.address,
      city: req.body.city,
      numberOfGates: req.body.numberOfGates,
      email: req.body.email,
      timings: req.body.timings,
      status: req.body.status || 'unverified', // Default to 'unverified' if status is not provided
    });

    // Check if the password is present in the request body
    if (!req.body.password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // Encrypt the password before saving
    const saltRounds = 10; // Adjust the number of salt rounds as needed

    bcrypt.hash(req.body.password, saltRounds, async (err, hashedPassword) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while hashing the password.' });
      } else {
        newSchool.password = hashedPassword;

        // Save the new school to the database
        const savedSchool = await newSchool.save();

        // Create a verification link with the school's ID
        const verificationLink = `http://localhost:3000/register-verify/${savedSchool._id}`;

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
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while registering the school.' });
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

    res.json({ message: 'School email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while verifying the email' });
  }
}


async function Login(req, res) {
  const { identifier, password } = req.body;

  try {
    // Find the school by either 'branchName' or 'email'
    const school = await School.findOne({ $or: [{ branchName: identifier }, { email: identifier }] });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check the password using bcrypt
    if (!bcrypt.compareSync(password, school.password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const payload = { schoolId: school._id, username: school.branchName, email: school.email, role: 'school' };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '72h' });

    // Return the token along with a success message
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
}


async function changeSchoolStatusById(req, res) {
  try {
    const { schoolId, newStatus } = req.body;

    // Find the school by its ID
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    // Check if the new status is one of the allowed values
    if (!['unverified', 'verified', 'active', 'inactive', 'blocked'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Update the school's status
    school.status = newStatus;
    await school.save();

    // Send a success response
    res.status(200).json({ success: true, message: 'School status updated successfully' });
  } catch (error) {
    console.error(error);
    // Send an error response
    res.status(500).json({ success: false, message: 'An error occurred while updating the school status' });
  }
}

async function getAllSchools(req, res) {
  try {
    const schools = await School.find();
    
    // Send schools in the response
    res.status(200).json({ schools });
  } catch (error) {
    console.error(error);
    // Send an error response
    res.status(500).json({ error: 'An error occurred while fetching all schools' });
  }
}

async function getSchoolById(req, res) {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    const school = await School.findById(id);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Send school details in the response
    res.status(200).json({ school });
  } catch (error) {
    console.error(error);
    // Send an error response
    res.status(500).json({ error: 'An error occurred while fetching school details by ID' });
  }
}


async function getSchoolsByStatus(req, res) {
  try {
    const { status } = req.body;

    if (!['unverified', 'verified', 'active', 'inactive', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const schools = await School.find({ status: status });

    // Send schools in the response
    res.status(200).json({ schools });
  } catch (error) {
    console.error(error);
    // Send an error response
    res.status(500).json({ error: 'An error occurred while filtering schools by status' });
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
  const resetLink = `http://localhost:3000/reset-password/${school._id}/${resetToken}/${expirationTime}`;
  
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


async function updateTiming(req, res) {
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
  // If the day does not exist, add a new timing
  school.timings.push({
    day,
    openTime: moment(openTime, 'hh:mm A').toDate(),
    closeTime: moment(closeTime, 'hh:mm A').toDate(),
  });
} else {
  // Update the open and close times if the day exists
  school.timings[dayIndex].openTime = moment(openTime, 'hh:mm A').toDate();
  school.timings[dayIndex].closeTime = moment(closeTime, 'hh:mm A').toDate();
}
    

    // Save the changes
    await school.save();

    return res.status(200).json({ message: 'Timings updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}


async function deleteUnverifiedSchools() {
  try {
    // Find schools with 'unverified' status and registration time older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unverifiedSchoolsToDelete = await School.find({
      status: 'unverified',
      createdAt: { $lt: twentyFourHoursAgo },
    }).exec();

    for (const school of unverifiedSchoolsToDelete) {
      // You might want to send a notification or do additional cleanup before deleting
      console.log(`Deleting unverified school with ID: ${school._id}`);
      await School.deleteOne({ _id: school._id }).exec();
    }
  } catch (err) {
    console.error('Error while deleting unverified schools:', err);
  }
}

// Schedule the task to run every day at a specific time (e.g., midnight)
cron.schedule('0 0 * * *', deleteUnverifiedSchools);// Schedule the task to run every day at a specific time (e.g., midnight)

const getTotalSchoolCount = async (req,res) =>{
  try {
    // Use the countDocuments method to get the total count of students
    const totalSchoolCount = await School.countDocuments();

    res.status(200).json({ totalSchoolCount });
  } catch (error) {
    console.error('Error getting total school count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {

  getTotalSchoolCount,registerSchool,verifyEmail,Login,getAllSchools,getSchoolsByStatus,changeSchoolStatusById,forgotPassword,resetPassword,updateTiming,getSchoolById
};
