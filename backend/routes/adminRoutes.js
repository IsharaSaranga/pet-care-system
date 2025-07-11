import express from 'express';
import { login, getProfile, registerAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', login);

// Protected routes
router.get('/profile', adminAuth, getProfile);

export default router;
