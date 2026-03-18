import express from 'express';
import { getPlatformStats, getDashboardMetrics } from '../controller/statsController.js';

const router = express.Router();

/**
 * @route GET /api/stats
 * @desc Get platform statistics for landing page
 * @access Public
 */
router.get('/', getPlatformStats);

/**
 * @route GET /api/stats/dashboard
 * @desc Get dashboard metrics
 * @access Public
 */
router.get('/dashboard', getDashboardMetrics);

export default router;
