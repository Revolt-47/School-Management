const SuperAdmin = require('../models/SuperAdminModel');
const jwt = require('jsonwebtoken');

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

module.exports = {
  loginSuperAdmin,
};
