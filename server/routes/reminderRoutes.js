import express from 'express';
import { getReminders, createReminder, deleteReminder } from '../controllers/reminderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getReminders);
router.post('/', createReminder);
router.delete('/:id', deleteReminder);

export default router;
