const bcrypt = require('bcrypt');
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
    const { name, cnic, address, contactNumber, email, children } = req.body;

    // Find the guardian by ID
    const guardianToUpdate = await Guardian.findById(guardianId);

    if (!guardianToUpdate) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    // Update guardian information
    if (name) {
      guardianToUpdate.name = name;
    }

    if (cnic) {
      guardianToUpdate.cnic = cnic;
    }

    if (address) {
      guardianToUpdate.address = address;
    }

    if (contactNumber) {
      guardianToUpdate.contactNumber = contactNumber;
    }

    if (email) {
      guardianToUpdate.email = email;
    }

    // Update children information
    if (children && Array.isArray(children)) {
      // Your logic to update children array here
    }

    // Save the updated guardian to the database
    await guardianToUpdate.save();

    res.status(200).json({ message: 'Guardian updated successfully.', guardian: guardianToUpdate });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Duplicate key violation. Guardian with the same email or CNIC already exists.' });
    }
    console.error('Error updating guardian:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getGuardianDetails = async (req, res) => {
  try {
    const { guardianId } = req.params;

    // Find the guardian by ID and populate the children details
    const guardian = await Guardian.findById(guardianId).populate({
      path: 'children',
      populate: {
        path: 'child',
        model: 'Student',
        populate: {
          path: 'school',
          model: 'School',
        },
      },
    });

    
    

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
    const { guardianId, childId } = req.body;

    console.log(req.body);
    const guardian = await Guardian.findById(guardianId);

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    console.log(guardian)

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

const changePassword = async (req, res) => {
  try {
    const { guardianId, oldPassword, newPassword } = req.body;

    // Find the guardian by ID
    const guardian = await Guardian.findById(guardianId);

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(oldPassword, guardian.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the guardian's password
    guardian.password = hashedNewPassword;

    // Save the updated guardian to the database
    await guardian.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


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

async function getGuardians(req,res){
  try {
    const studentId = req.params.studentId;

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find guardians who are the guardians of the given student with relation 'guardian'
    const guardians = await Guardian.find({
      'children.child': studentId,
      'children.relation': 'guardian',
    });

    res.json(guardians);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getAllGuardians = async (req, res) => {
  try {
    const guardians = await Guardian.find();
    res.json(guardians);
  } catch (error) {
    console.error('Error fetching all guardians:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const assignChildToGuardian = async (req, res) => {
  try {
    const { guardianId, children } = req.body;

    // Find the guardian by ID
    const guardian = await Guardian.findById(guardianId);

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found.' });
    }

    // Assign children to the guardian
    children.forEach((childId) => {
      guardian.children.push({ child: childId, relation: 'guardian' });
    });

    // Save the updated guardian to the database
    await guardian.save();

    res.status(200).json({ message: 'Children assigned to the guardian successfully.' });
  } catch (error) {
    console.error('Error assigning children to guardian:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createGuardianAccount,
  deleteGuardianById,
  updateGuardian,
  getGuardianDetails,
  removeChildFromGuardian,
  loginGuardian,
  forgotPassword,
  resetPassword,
  changePassword,
  getGuardians,
  getAllGuardians,
  assignChildToGuardian,
};
