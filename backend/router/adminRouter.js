import express from 'express';
import { body, validationResult } from 'express-validator';
import { adminLogin, getAdminProfile, getAllCitizens, getAllOfficers } from '../controller/loginController.js';
import { getAllComplaints, assignOfficerToComplaint, autoAssignCategoryComplaints, markComplaintUrgent, escalateComplaint, getAuditLogs, createOfficer } from '../controller/adminController.js';
import { deleteCitizen, updateCitizen, getAllAreas, createArea, updateArea, deleteArea, assignOfficerToArea, getAllFeedback, getAdminSettings, updateAdminSettings, blockCitizen, blockOfficer } from '../controller/adminController.js';
import { getAllCategories, addCategory, editCategory, deleteCategory } from '../controller/categoryController.js';
import { updateOfficer, deleteOfficer } from '../controller/adminController.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// Audit log route
router.get('/audit-logs', verifyAdminToken, getAuditLogs);

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
router.put('/citizens/:id/block', verifyAdminToken, blockCitizen);
router.delete('/citizens/:id', verifyAdminToken, deleteCitizen);

router.get('/officers', verifyAdminToken, getAllOfficers);
router.post(
	'/officers',
	verifyAdminToken,
	[
		body('name').notEmpty().withMessage('Name is required'),
		body('email').isEmail().withMessage('Valid email is required'),
		body('department').isIn(["Road Damage", "Garbage", "Streetlight", "Water Leakage", "Other"]).withMessage('Department must be a valid enum'),
		body('area').notEmpty().withMessage('Area is required'),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, errors: errors.array(), message: 'Validation failed' });
		}
		next();
	},
	createOfficer
);
router.put('/officers/:id', verifyAdminToken, updateOfficer);
router.put('/officers/:id/block', verifyAdminToken, blockOfficer);
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
