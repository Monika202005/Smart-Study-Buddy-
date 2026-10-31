import express from 'express';
import { createSession, getSessions } from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createSession);
router.get('/', getSessions);

export default router;
