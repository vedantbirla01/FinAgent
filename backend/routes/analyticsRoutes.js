import express from 'express';
import { getCategorySummary, getMonthlyTrend, getBudgetVsActual } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/category-summary', protect, getCategorySummary);
router.get('/monthly-trend', protect, getMonthlyTrend);
router.get('/budget-vs-actual', protect, getBudgetVsActual);

export default router;