import jwt from 'jsonwebtoken';
import Professional from '../models/Professional.js';
import bcrypt from 'bcryptjs';

export const loginProfessional = async (req, res) => {
  const { pemail, ppassword } = req.body;
  try {
    const professional = await Professional.findOne({ pemail });
    if (!professional) {
      console.log('Professional not found for email:', pemail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await professional.comparePassword(ppassword);
    if (!isMatch) {
      console.log('Password mismatch for email:', pemail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: professional.pID, name: professional.pName, email: professional.pemail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Generated token for pID:', professional.pID);
    res.json({ token, professional: { pID: professional.pID, pName: professional.pName } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};