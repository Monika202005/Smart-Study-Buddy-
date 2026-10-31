import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', toggleTaskComplete);

export default router;
