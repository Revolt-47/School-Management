const School = require('../models/SchoolModel'); // Adjust the path to your model file
const bcrypt =  require('bcryptjs'); // For password hashing
const cron = require('node-cron');
const moment = require('moment');


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

async function getAllSchools(req, res) {backend/controllersbackend/controllers
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

const changePassword = async (req, res) => {
  try {
    const { schoolId, oldPassword, newPassword } = req.body;

    // Find the school by ID
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'school not found.' });
    }

    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(oldPassword, school.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the school's password
    school.password = hashedNewPassword;

    // Save the updated school to the database
    await school.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {

  changePassword,getTotalSchoolCount,getAllSchools,getSchoolsByStatus,changeSchoolStatusById,updateTiming,getSchoolById

};
