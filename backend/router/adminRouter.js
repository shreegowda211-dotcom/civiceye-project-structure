import express from 'express';
import { adminLogin, getAdminProfile, getAllCitizens, getAllOfficers, createOfficer } from '../controller/loginController.js';
import { getAllComplaints, assignOfficerToComplaint, autoAssignCategoryComplaints, markComplaintUrgent, escalateComplaint } from '../controller/adminController.js';
import { deleteCitizen, updateCitizen, getAllAreas, createArea, updateArea, deleteArea, assignOfficerToArea, getAllFeedback, getAdminSettings, updateAdminSettings } from '../controller/adminController.js';
import { getAllCategories, addCategory, editCategory, deleteCategory } from '../controller/categoryController.js';
import { updateOfficer, deleteOfficer } from '../controller/adminController.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// only login, profile routes
router.post('/login', adminLogin);
router.get('/profile', verifyAdminToken, getAdminProfile);

// Complaint routes for admin
router.get('/complaints', verifyAdminToken, getAllComplaints);
router.put('/complaints/:complaintId/assign', verifyAdminToken, assignOfficerToComplaint);
router.put('/complaints/:complaintId/urgent', verifyAdminToken, markComplaintUrgent);
router.put('/complaints/:complaintId/escalate', verifyAdminToken, escalateComplaint);
router.post('/complaints/auto-assign', verifyAdminToken, autoAssignCategoryComplaints);

// User management routes for admin
router.get('/citizens', verifyAdminToken, getAllCitizens);
router.put('/citizens/:id', verifyAdminToken, updateCitizen);
router.delete('/citizens/:id', verifyAdminToken, deleteCitizen);

router.get('/officers', verifyAdminToken, getAllOfficers);
router.post('/officers', verifyAdminToken, createOfficer);
router.put('/officers/:id', verifyAdminToken, updateOfficer);
router.delete('/officers/:id', verifyAdminToken, deleteOfficer);

// Area management
router.get('/areas', verifyAdminToken, getAllAreas);
router.post('/areas', verifyAdminToken, createArea);
router.put('/areas/:id', verifyAdminToken, updateArea);
router.delete('/areas/:id', verifyAdminToken, deleteArea);
router.put('/areas/:id/assign-officer', verifyAdminToken, assignOfficerToArea);

// Category management
router.get('/categories', verifyAdminToken, getAllCategories);
router.post('/categories', verifyAdminToken, addCategory);
router.put('/categories/:id', verifyAdminToken, editCategory);
router.delete('/categories/:id', verifyAdminToken, deleteCategory);

// Feedback and settings
router.get('/feedback', verifyAdminToken, getAllFeedback);
router.get('/settings', verifyAdminToken, getAdminSettings);
router.put('/settings', verifyAdminToken, updateAdminSettings);

export default router;
