const SuperAdmin = require('../models/SuperAdminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // For sending emails

async function loginSuperAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // Find the super admin by email
    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super admin not found' });
    }

    // Check if the provided password matches the stored password
    if (password !== superAdmin.password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const payload = { id: superAdmin.id, role: 'admin' };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '72h' });

    // Log in successful
    res.status(200).json({ message: 'Super admin logged in successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while logging in.' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  // Find the admin by email
  const admin = await SuperAdmin.findOne({ email });

  if (!admin) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate a unique reset token
  const resetToken = crypto.randomBytes(16).toString('hex'); // You can adjust the token length

  // Calculate the expiration time for the reset link (10 minutes from now)
  const expirationTime = Date.now() + 600000; // 10 minutes in milliseconds

  // Include the reset token and expiration time in the reset link
  const resetLink = `http://localhost:3000/reset-password/${admin._id}/${resetToken}/${expirationTime}`;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amirdaniyal47@gmail.com',
      pass: 'zucq jdwo iqwp wttd',
    },
  });

  const mailOptions = {
    from: 'amirdaniyal47@gmail.com',
    to: admin.email,
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
  const { adminId, resetToken, expirationTime, newPassword } = req.body;
  
  // Find the admin by ID
  const admin = await admin.findById(adminId);

  if (!admin) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if the expiration time has passed (link is expired)
  if (expirationTime < Date.now()) {
    return res.status(401).json({ error: 'Reset link has expired' });
  }


  admin.password = newPassword;

  await admin.save();

  res.status(200).json({ message: 'Password reset successful' });
}


module.exports = {
  loginSuperAdmin,
  forgotPassword,
  resetPassword
};
