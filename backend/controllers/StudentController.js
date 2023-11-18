const Student = require('../models/StudentModel'); // Adjust the path based on your project structure

// Function to add a new student
const addStudent = async (req, res) => {
    try {
      const {
        name,
        cnic,
        rollNumber,
        rfidTag,
        section,
        class: studentClass,
        school,
      } = req.body;
  
      // Check if the CNIC or roll number already exists
      const existingStudent = await Student.findOne({
        $or: [{ cnic }, { rollNumber }],
      });
  
      if (existingStudent) {
        return res.status(400).json({ error: 'Student with CNIC or Roll Number already exists.' });
      }
  
      // Create a new student
      const newStudent = new Student({
        name,
        cnic,
        rollNumber,
        rfidTag,
        section,
        class: studentClass,
        school,
      });
  
      // Save the new student to the database
      await newStudent.save();
  
      // Update the numberOfStudents for the corresponding school
      await School.findByIdAndUpdate(
        school,
        { $inc: { numberOfStudents: 1 } }, // Increment the numberOfStudents by 1
        { new: true } // Return the updated school document
      );
  
      res.status(201).json({ message: 'Student added successfully.', student: newStudent });
    } catch (error) {
      console.error('Error adding student:', error);
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
    console.log('hit')
    try {
      const { studentId } = req.params;
      const { rfidTag, studentClass, section } = req.body;
  
      // Check if the student exists
      const existingStudent = await Student.findById(studentId);
  
      if (!existingStudent) {
        return res.status(404).json({ error: 'Student not found.' });
      }
  
      // Update RFID tag, class, and section
      existingStudent.rfidTag = rfidTag || existingStudent.rfidTag;
      existingStudent.class = studentClass || existingStudent.class;
      existingStudent.section = section || existingStudent.section;
  
      // Save the updated student to the database
      await existingStudent.save();
  
      res.json({ message: 'Student updated successfully.', student: existingStudent });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // Function to get students of a school
const getStudentsBySchool = async (req, res) => {
    try {
      const { schoolId } = req.params; // Assuming schoolId is provided in the request parameters
  
      // Find students with the given schoolId
      const students = await Student.find({ school: schoolId });
  
      res.status(200).json({ students });
    } catch (error) {
      console.error('Error getting students by school:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const getTotalStudentsCount = async (req,res) =>{
  try {
    // Use the countDocuments method to get the total count of students
    const totalStudentsCount = await Student.countDocuments();

    res.status(200).json({ totalStudentsCount });
  } catch (error) {
    console.error('Error getting total students count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}

module.exports = {
  addStudent,
  deleteStudent,
  updateStudent,
  getStudentsBySchool,
  getTotalStudentsCount
};
