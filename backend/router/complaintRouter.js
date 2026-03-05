import express from "express";
import { createComplaint, getComplaintsByCitizen, getAllComplaints } from "../controller/complaintController.js";
import { verifyCitizenToken, verifyOfficerToken } from "../middleware/authAdmin.js";

const router = express.Router();

// Create a new complaint
router.post("/", verifyCitizenToken, createComplaint);

// Get complaints for the logged-in citizen
router.get("/my-complaints", verifyCitizenToken, getComplaintsByCitizen);

// Get all complaints (for admin/officer)
router.get("/", verifyOfficerToken, getAllComplaints);