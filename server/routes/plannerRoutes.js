import express from 'express';
import { handleGeneratePlan, handleRescheduleMissed } from '../controllers/plannerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', handleGeneratePlan);
router.post('/reschedule-missed', handleRescheduleMissed);

export default router;
