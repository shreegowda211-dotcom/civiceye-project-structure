import express from 'express';
import { officerLogin, getOfficerProfile } from '../controller/loginController.js';
import { getComplaintsForOfficer, updateComplaintStatus, getOfficerPerformance } from '../controller/complaintController.js';
import { verifyOfficerToken } from '../middleware/authAdmin.js';

const router = express.Router();

// officer registration route has been disabled by project requirement
// router.post("/register", officerRegister);
router.post("/login", officerLogin);
router.get("/profile", verifyOfficerToken, getOfficerProfile);

// Complaint routes for officers - filtered by their department
router.get("/complaints", verifyOfficerToken, getComplaintsForOfficer);
router.put("/complaints/:complaintId/status", verifyOfficerToken, updateComplaintStatus);

// Performance analytics route
router.get("/performance", verifyOfficerToken, getOfficerPerformance);

export default router;
