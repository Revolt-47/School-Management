const SuperAdmin = require('../models/SuperAdminModel');
const bcrypt = require('bcrypt');



async function loginSuperAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // Find the super admin by email
    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super admin not found' });
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, superAdmin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Log in successful
    res.status(200).json({ message: 'Super admin logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while logging in.' });
  }
}

module.exports = {
  loginSuperAdmin,
};
