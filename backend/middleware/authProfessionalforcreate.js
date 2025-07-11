import jwt from 'jsonwebtoken';
import Professional from '../models/professionalModel.js';

export const profAuthcreate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token in profAuth:", decoded);

    const professional = await Professional.findById(decoded.id).select('-ppassword');
    if (!professional) {
      return res.status(401).json({ error: 'Professional not found' });
    }

    // Attach both the decoded token and the professional document
    req.professional = {
      tokenData: decoded, // Decoded token with id, pID, role
      professionalData: professional, // Professional document from DB
    };
    console.log("req.professional set in profAuth:", req.professional);

    next();
  } catch (error) {
    console.error("Error in profAuth:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    const role = req.professional.tokenData.role || req.professional.professionalData.role;
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};