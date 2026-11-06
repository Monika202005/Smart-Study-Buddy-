import express from 'express';
import { updateTopic, deleteTopic } from '../controllers/subjectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;
