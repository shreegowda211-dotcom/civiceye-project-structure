import express from "express";
import { getHelpContent, searchHelp, getHelpByCategory } from "../controller/helpController.js";
import Area from "../model/areaSchema.js";

const router = express.Router();

// Get all help content
router.get("/", getHelpContent);

// Search help content
router.get("/search", searchHelp);

// Get help by category
router.get("/category/:category", getHelpByCategory);

// ========== PUBLIC AREAS ENDPOINT ==========
// Get all areas (public endpoint for citizens to select areas when reporting issues)
router.get("/areas", async (req, res) => {
  try {
    const areas = await Area.find()
      .select('_id name code description')
      .sort({ name: 1 })
      .lean();
    
    res.status(200).json({
      success: true,
      message: 'Areas retrieved successfully',
      data: areas || [],
      total: areas.length
    });
  } catch (error) {
    console.error('Error fetching areas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch areas',
      error: error.message
    });
  }
});

export default router;
