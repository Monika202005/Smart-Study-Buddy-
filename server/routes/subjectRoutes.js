import express from 'express';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTopicsForSubject,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/subjectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Subject routes
router.get('/', getSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

// Topics under subject routes
router.get('/:id/topics', getTopicsForSubject);
router.post('/:id/topics', createTopic);

export default router;
