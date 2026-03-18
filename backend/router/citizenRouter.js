import express from 'express';
import { citizenRegister } from '../controller/citizenController.js';
import { citizenLogin, getProfile } from '../controller/loginController.js';
import { createComplaint, getComplaintsByCitizen, getComplaintById } from '../controller/complaintController.js';
import { getNotifications, markNotificationRead } from '../controller/notificationController.js';
import { verifyCitizenToken } from '../middleware/authAdmin.js';

const router = express.Router();

router.post("/register", citizenRegister);
router.post("/login", citizenLogin);
router.get("/profile", verifyCitizenToken, getProfile);

// Complaint routes
router.post("/complaints", verifyCitizenToken, createComplaint);
router.get("/complaints", verifyCitizenToken, getComplaintsByCitizen);
router.get("/complaints/:complaintId", verifyCitizenToken, getComplaintById);

// Notification routes
router.get("/notifications", verifyCitizenToken, getNotifications);
router.post("/notifications/:id/read", verifyCitizenToken, markNotificationRead);

export default router;