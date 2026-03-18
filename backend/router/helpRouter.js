import express from "express";
import { getHelpContent, searchHelp, getHelpByCategory } from "../controller/helpController.js";

const router = express.Router();

// Get all help content
router.get("/", getHelpContent);

// Search help content
router.get("/search", searchHelp);

// Get help by category
router.get("/category/:category", getHelpByCategory);

export default router;
