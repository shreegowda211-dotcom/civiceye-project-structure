import express from 'express';
import { citizenRegister } from '../controller/citizenController.js';
import { citizenLogin, getProfile } from '../controller/loginController.js';
import { verifyCitizenToken } from '../middleware/authAdmin.js';

const router = express.Router();

router.post("/register", citizenRegister);
router.post("/login", citizenLogin);
router.get("/profile", verifyCitizenToken, getProfile);

export default router;