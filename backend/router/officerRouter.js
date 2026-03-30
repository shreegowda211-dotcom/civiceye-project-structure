import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { officerLogin, getOfficerProfile } from '../controller/loginController.js';
import { getComplaintsForOfficer, updateComplaintStatus, getOfficerPerformance } from '../controller/complaintController.js';
import { getOfficerNotifications, markOfficerNotificationRead, markAllOfficerNotificationsRead } from '../controller/officerNotificationController.js';
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
router.put(
  "/complaints/:complaintId/status",
  verifyOfficerToken,
  upload.single("proofImage"),
  [
    body("status")
      .isIn(["pending", "in-progress", "resolved"])
      .withMessage('Status must be "pending", "in-progress", or "resolved"'),
    body("notes").custom((value, { req }) => {
      if (req.body.status === "resolved" && (!value || value.trim() === "")) {
        throw new Error("Notes must not be empty if status is resolved");
      }
      return true;
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateComplaintStatus
);

// Performance analytics route
router.get("/performance", verifyOfficerToken, getOfficerPerformance);

// Notification routes
router.get("/notifications", verifyOfficerToken, getOfficerNotifications);
router.put("/notifications/:id/read", verifyOfficerToken, markOfficerNotificationRead);
router.put("/notifications/read-all", verifyOfficerToken, markAllOfficerNotificationsRead);

export default router;
