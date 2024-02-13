const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Guardian = require('../models/GuardianModel');
const Student = require('../models/StudentModel');
const School = require('../models/SchoolModel');
const jwt  = require('jsonwebtoken')

const createGuardianAccount = async (req, res) => { 
  try {
    const {
      name,
      cnic,
      address,
      contactNumber,
      email,
      children,
    } = req.body;

    // Check if the email and CNIC combination is unique
    const existingGuardian = await Guardian.findOne({ email, cnic });

    if (existingGuardian) {
      // If the guardian already exists, add the children to the guardian's children array
      if (children && Array.isArray(children)) {
        existingGuardian.children = existingGuardian.children || [];

        for (const child of children) {
          const { childId, relation } = child;
      
          // Check if the child is already in the guardian's children array
          if (
            existingGuardian.children.some(
              c => c.child && c.child.equals && c.child.equals(child.child)
            )
          ) {
            return res.status(400).json({ error: 'Child is already associated with this guardian.' });
          }

          // Check if the child exists in the system
          const existingChild = await Student.findById(child.child);
          if (!existingChild) {
            return res.status(400).json({ error: 'Child does not exist in the system.' });
          }

          existingGuardian.children.push({ child: child.child, relation });
        }

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
        children: children || [],
      });


      // Send credentials over email using Node Mailer
      const randomPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      newGuardian.password = hashedPassword;
      await newGuardian.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'amirdaniyal47@gmail.com',
          pass: process.env.EMAILPW,
        },
      });

      const mailOptions = {
        from: 'amirdaniyal47@gmail.com',
        to: email,
        subject: 'Your Credentials',
        text: `Your credentials:\nEmail: ${email}\nPassword: ${randomPassword} for VanGuardain Parent/Guardian app `,
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
  }
  catch (error) {
    if(error.code === 11000){
      return res.status(409).json({ error: 'Duplicate key violation. Guardian with the same email or CNIC already exists.' });
    }
    console.error('Error creating guardian account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const loginGuardian = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the guardian by email
    const guardian = await Guardian.findOne({ email });

    if (!guardian) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, guardian.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Generate a token (you may want to use a more secure approach in a production environment)
    const token = jwt.sign({ guardianId: guardian._id, role:"guardian" },process.env.SECRET, { expiresIn: '172h' });

    res.status(200).json({ token,guradianId : guardian._id });
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
  const guardian = await Guardian.findById(guardianId);

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
  loginGuardian,
  forgotPassword,
  resetPassword,
};
