import express from 'express';
import { citizenRegister, submitFeedback, getFeedback } from '../controller/citizenController.js';
import { citizenLogin, getProfile, updateProfile } from '../controller/loginController.js';
import { createComplaint, getComplaintsByCitizen, getComplaintById } from '../controller/complaintController.js';
import { getNotifications, markNotificationRead } from '../controller/notificationController.js';
import { verifyCitizenToken } from '../middleware/authAdmin.js';
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Save files to 'uploads/' directory
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

router.post("/register", citizenRegister);
router.post("/login", citizenLogin);
router.get("/profile", verifyCitizenToken, getProfile);
router.put("/profile", verifyCitizenToken, updateProfile);

// Complaint routes
router.post("/complaints", verifyCitizenToken, upload.single("image"), createComplaint);
router.get("/complaints", verifyCitizenToken, getComplaintsByCitizen);
router.get("/complaints/:complaintId", verifyCitizenToken, getComplaintById);

// Notification routes
router.get("/notifications", verifyCitizenToken, getNotifications);
router.post("/notifications/:id/read", verifyCitizenToken, markNotificationRead);

// Citizen feedback routes
router.get("/feedback", verifyCitizenToken, getFeedback);
router.post("/feedback", verifyCitizenToken, submitFeedback);

export default router;