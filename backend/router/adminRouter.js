import express from 'express';
import { adminLogin, getAdminProfile, getAllCitizens, getAllOfficers, createOfficer } from '../controller/loginController.js';
import { getAllComplaints } from '../controller/complaintController.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// only login, profile routes
router.post('/login', adminLogin);
router.get('/profile', verifyAdminToken, getAdminProfile);

// Complaint routes for admin
router.get('/complaints', verifyAdminToken, getAllComplaints);

// User management routes for admin
router.get('/citizens', verifyAdminToken, getAllCitizens);
router.get('/officers', verifyAdminToken, getAllOfficers);
router.post('/officers', verifyAdminToken, createOfficer);

export default router;
