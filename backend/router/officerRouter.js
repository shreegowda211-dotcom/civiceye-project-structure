import express from 'express';
import multer from 'multer';
import { officerLogin, getOfficerProfile } from '../controller/loginController.js';
import { getComplaintsForOfficer, updateComplaintStatus, getOfficerPerformance } from '../controller/complaintController.js';
import { verifyOfficerToken } from '../middleware/authAdmin.js';

const router = express.Router();

// Configure multer for file uploads (proof images)
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

// officer registration route has been disabled by project requirement
// router.post("/register", officerRegister);
router.post("/login", officerLogin);
router.get("/profile", verifyOfficerToken, getOfficerProfile);

// Complaint routes for officers - filtered by their department
router.get("/complaints", verifyOfficerToken, getComplaintsForOfficer);
router.put("/complaints/:complaintId/status", verifyOfficerToken, upload.single("proofImage"), updateComplaintStatus);

// Performance analytics route
router.get("/performance", verifyOfficerToken, getOfficerPerformance);

export default router;
