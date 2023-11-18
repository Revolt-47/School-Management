const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Guardian = require('../models/GuardianModel');
const Student = require('../models/StudentModel');
const jwt  = require('jsonwebtoken')

const createGuardianAccount = async (req, res) => {
  try {
    const {
      name,
      cnic,
      address,
      contactNumber,
      email,
      children, // Assuming children is an array of objects with childId and relation
    } = req.body;

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex');

    // Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Check if the guardian already exists
    const existingGuardian = await Guardian.findOne({ cnic });

    if (existingGuardian) {
      // If the guardian already exists, add the children to the guardian's children array
      if (children && Array.isArray(children)) {
        children.forEach(async (child) => {
          const { childId, relation } = child;
          if (!existingGuardian.children.some(c => c.child.equals(childId))) {
            existingGuardian.children.push({ child: childId, relation });
          }
        });
        await existingGuardian.save();
        res.status(200).json({ message: 'Children added to an existing guardian.' });
      } else {
        res.status(400).json({ error: 'Children information is required in the request body.' });
      }
    } else {
      // If the guardian doesn't exist, create a new guardian
      const newGuardian = new Guardian({
        name,
        cnic,
        address,
        contactNumber,
        email,
        password: hashedPassword,
        children: children || [], // Create an array with the children if provided
      });

      // Save the new guardian to the database
      await newGuardian.save();

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
        text: `Your credentials:\nContact Number: ${contactNumber}\nPassword: ${randomPassword} for VanGuardain Parent/Guardian app `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({ message: 'Guardian account created successfully.' });
        }
      });
    }
  } catch (error) {
    console.error('Error creating guardian account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to delete a guardian by ID
const deleteGuardianById = async (req, res) => {
  try {
    const { guardianId } = req.params;

    // Find and delete the guardian by ID
    const deletedGuardian = await Guardian.findByIdAndDelete(guardianId);

    if (!deletedGuardian) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    res.status(200).json({ message: 'Guardian deleted successfully.' });
  } catch (error) {
    console.error('Error deleting guardian:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update guardian information
const updateGuardian = async (req, res) => {
  try {
    const { guardianId } = req.params;
    const { address, contactNumber, email } = req.body;

    // Find the guardian by ID
    const guardianToUpdate = await Guardian.findById(guardianId);

    if (!guardianToUpdate) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    // Update guardian information
    if (address) {
      guardianToUpdate.address = address;
    }

    if (contactNumber) {
      guardianToUpdate.contactNumber = contactNumber;
    }

    if (email) {
      guardianToUpdate.email = email;
    }

    // Save the updated guardian to the database
    await guardianToUpdate.save();

    res.status(200).json({ message: 'Guardian updated successfully.', guardian: guardianToUpdate });
  } catch (error) {
    console.error('Error updating guardian:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getGuardianDetails = async (req, res) => {
  try {
    const { guardianId } = req.params;

    // Find the guardian by ID and populate the children details
    const guardian = await Guardian.findById(guardianId).populate('children.child');

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    res.status(200).json({ guardian });
  } catch (error) {
    console.error('Error getting guardian details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removeChildFromGuardian = async (req, res) => {
  try {
    const { guardianId, childId } = req.params;

    // Find the guardian by ID
    const guardian = await Guardian.findById(guardianId);

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    // Check if the childId exists in the guardian's children array
    const childToRemoveIndex = guardian.children.findIndex(child => child.child.equals(childId));

    if (childToRemoveIndex === -1) {
      return res.status(400).json({ error: 'Child not associated with this guardian.' });
    }

    // Remove the child from the guardian's children array
    guardian.children.splice(childToRemoveIndex, 1);

    // Save the updated guardian to the database
    await guardian.save();

    res.status(200).json({ message: 'Child removed from the guardian successfully.' });
  } catch (error) {
    console.error('Error removing child from guardian:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const loginGuardian = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the guardian by email
    const guardian = await Guardian.findOne({ email });

    if (!guardian) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, guardian.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate a token (you may want to use a more secure approach in a production environment)
    const token = jwt.sign({ guardianId: guardian._id, role:"guardian" },process.env.SECRET, { expiresIn: '72h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in guardian:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function forgotPassword(req, res) {
  const { email } = req.body;

  // Find the guardian by email
  const guardian = await Guardian.findOne({ email });

  if (!guardian) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate a unique reset token
  const resetToken = crypto.randomBytes(16).toString('hex'); // You can adjust the token length

  // Calculate the expiration time for the reset link (10 minutes from now)
  const expirationTime = Date.now() + 600000; // 10 minutes in milliseconds

  // Include the reset token and expiration time in the reset link
  const resetLink = `http://localhost:3000/reset-password/${guardian._id}/${resetToken}/${expirationTime}`;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amirdaniyal47@gmail.com',
      pass: 'zucq jdwo iqwp wttd',
    },
  });

  const mailOptions = {
    from: 'amirdaniyal47@gmail.com',
    to: guardian.email,
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
  const { guardianId, resetToken, expirationTime, newPassword } = req.body;
  
  // Find the guardian by ID
  const guardian = await guardian.findById(guardianId);

  if (!guardian) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if the expiration time has passed (link is expired)
  if (expirationTime < Date.now()) {
    return res.status(401).json({ error: 'Reset link has expired' });
  }

  // Reset the user's password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  guardian.password = hashedPassword;

  await guardian.save();

  res.status(200).json({ message: 'Password reset successful' });
}


module.exports = {
  createGuardianAccount,
  deleteGuardianById,
  updateGuardian,
  getGuardianDetails,
  removeChildFromGuardian,
  loginGuardian,
  forgotPassword,
  resetPassword
};
