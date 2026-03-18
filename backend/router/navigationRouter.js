import express from "express";
import {
  getUserNotifications,
  getNavigationConfig,
  markNotificationAsRead,
  getUserProfile,
} from "../controller/navigationController.js";

const router = express.Router();

// Get user notifications
router.get("/notifications", getUserNotifications);

// Get navigation configuration based on user role
router.get("/config", getNavigationConfig);

// Mark notification as read
router.post("/notifications/:notificationId/read", markNotificationAsRead);

// Get user profile
router.get("/profile", getUserProfile);

export default router;
