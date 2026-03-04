import express from 'express';
import { officerRegister } from '../controller/officerController.js';
import { officerLogin, getOfficerProfile } from '../controller/loginController.js';
import { verifyOfficerToken } from '../middleware/authAdmin.js';

const router = express.Router();

router.post("/register", officerRegister);
router.post("/login", officerLogin);
router.get("/profile", verifyOfficerToken, getOfficerProfile);

export default router;
