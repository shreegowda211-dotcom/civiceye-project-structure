import express from 'express';
import { adminLogin, getAdminProfile } from '../controller/loginController.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// only login, profile routes
router.post('/login', adminLogin);
router.get('/profile', verifyAdminToken, getAdminProfile);

export default router;
