const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Guardian = require('../models/GuardianModel');
const Student = require('../models/StudentModel');
const jwt  = require('jsonwebtoken')


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
  deleteGuardianById,
  updateGuardian,
  getGuardianDetails,
  removeChildFromGuardian,
  changePassword,
  getGuardians,
  getAllGuardians,
  assignChildToGuardian,
};
