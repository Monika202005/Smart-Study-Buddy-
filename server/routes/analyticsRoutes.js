import express from 'express';
import { getAnalyticsSummary } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getAnalyticsSummary);

export default router;
