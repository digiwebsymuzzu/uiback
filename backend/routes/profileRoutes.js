import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET profile
router.get('/', authMiddleware, getProfile);

// POST update profile
router.post('/update', authMiddleware, (req, res, next) => {
  console.log('[ROUTE] /update called');
  next(); // pass to controller
}, updateProfile);

export default router;


