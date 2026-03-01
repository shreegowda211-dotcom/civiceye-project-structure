import express from 'express';
import { citizenRegister } from '../controller/citizenController.js';
import { citizenLogin, getProfile } from '../controller/loginController.js';
import verifyAdminToken from '../middleware/authAdmin.js';

const router = express.Router();

router.post("/register", citizenRegister);
router.post("/login", citizenLogin);
router.get("/profile", verifyAdminToken, getProfile);

export default router;