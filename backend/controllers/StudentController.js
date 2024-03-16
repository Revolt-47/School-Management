const mongoose = require('mongoose');
const Student = require('../models/StudentModel');
const School = require('../models/SchoolModel');

// Function to add a new student
// ...

// Function to add a new student
// Function to add a new student
const addStudent = async (req, res) => {
  try {
    const { name, cnic, rollNumber, rfidTag, section, studentClass } = req.body;

    // Retrieve schoolId from the decoded token
    const { schoolId } = req.decoded;

    // Check if the CNIC, roll number, or RFID tag already exists
    const existingStudent = await Student.findOne({ $or: [{ cnic }, { rollNumber }, { rfidTag }] });

    if (existingStudent) {
      let duplicateField;
      if (existingStudent.cnic === cnic) {
        duplicateField = 'CNIC';
      } else if (existingStudent.rollNumber === rollNumber) {
        duplicateField = 'Roll Number';
      } else if (existingStudent.rfidTag === rfidTag) {
        duplicateField = 'RFID Tag';
      }
      return res.status(400).json({ error: `Duplicate key violation. Student with the same ${duplicateField} already exists.`, duplicateField });
    }

    // Create a new student with the retrieved schoolId
    const newStudent = new Student({
      name,
      cnic,
      rollNumber,
      rfidTag,
      section,
      studentClass,
      school: schoolId, // Set schoolId for the new student
    });

    // Save the new student to the database
    await newStudent.save();

    // Update the numberOfStudents for the corresponding school
    await School.findByIdAndUpdate(
      schoolId,
      { $inc: { numberOfStudents: 1 } }, // Increment the numberOfStudents by 1
      { new: true } // Return the updated school document
    );

    res.status(201).json({ message: 'Student added successfully.', student: newStudent });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.name === 'MongoError' && error.code === 11000) {
      // Duplicate key error (CNIC, Roll Number, or RFID Tag already exists)
      let duplicateField;
      if (error.keyPattern.cnic) {
        duplicateField = 'CNIC';
      } else if (error.keyPattern.rollNumber) {
        duplicateField = 'Roll Number';
      } else if (error.keyPattern.rfidTag) {
        duplicateField = 'RFID Tag';
      }
      return res.status(409).json({ error: `Duplicate key violation. Student with the same ${duplicateField} already exists.`, duplicateField });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Function to delete a student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the student exists
    const existingStudent = await Student.findById(id);

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Delete the student from the database
    await Student.findByIdAndDelete(id);

    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update a student
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name,cnic, rollNumber, rfidTag, studentClass, section } = req.body;

    // Check if the student exists
    const existingStudent = await Student.findById(studentId);

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Update RFID tag, class, and section
    existingStudent.rfidTag = rfidTag || existingStudent.rfidTag;

    // Check if studentClass is not an empty string before updating
    if (studentClass !== '') {
      existingStudent.studentClass = studentClass;
    }
    
    existingStudent.section = section || existingStudent.section;
    existingStudent.name = name || existingStudent.name;
    existingStudent.cnic = cnic || existingStudent.cnic;
    existingStudent.rollNumber = rollNumber || existingStudent.rollNumber;
    
    // Save the updated student to the database
    await existingStudent.save();

    res.json({ message: 'Student updated successfully.', student: existingStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 11000) {
      // Duplicate key error (CNIC or Roll Number already exists)
      return res.status(409).json({ error: 'Duplicate key violation. Student with the same CNIC or Roll Number already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Function to get students of a school
const getStudentsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.decoded;

    // Validate if schoolId is a valid ObjectId before querying the database
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ success: false, message: 'Invalid schoolId' });
    }

    // Find students with the given schoolId, and project only necessary fields
    const students = await Student.find({ school: schoolId }, { name: 1, cnic: 1, rollNumber: 1, rfidTag: 1, section: 1, studentClass: 1 });
    console.log('Students of this school are: ');
    console.log(students);

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error('Error getting students by school:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const getTotalStudentsCount = async (req, res) => {
  try{
    const {schoolId} = req.decoded;
    const totalStudentsCount = await Student.countDocuments({school:schoolId});
    res.status(200).json({ success: true, totalStudentsCount });
  }catch(error){
    res.status(500).json({ error: 'Internal Server Error' });
  } 
};

const getStudentbyID = async (req,res) => {
  const {studentId} = req.body;
  try{
    const std = await Student.findById(studentId);
    if(std != null){
      res.status(200).json({ success: true, std });
    }
    else{
      res.status(404).json({ error: 'Student not found' });
    }
  }catch(error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  addStudent,
  deleteStudent,
  updateStudent,
  getStudentsBySchool,
  getTotalStudentsCount,
  getStudentbyID
};
