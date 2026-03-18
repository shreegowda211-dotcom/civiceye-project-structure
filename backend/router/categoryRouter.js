import express from "express";
import { getAllCategories, addCategory, editCategory, deleteCategory } from "../controller/categoryController.js";
import { verifyAdminToken } from "../middleware/authAdmin.js";

const router = express.Router();

// Get all categories
router.get("/", verifyAdminToken, getAllCategories);
// Add category
router.post("/", verifyAdminToken, addCategory);
// Edit category
router.put("/:id", verifyAdminToken, editCategory);
// Delete category
router.delete("/:id", verifyAdminToken, deleteCategory);

export default router;
