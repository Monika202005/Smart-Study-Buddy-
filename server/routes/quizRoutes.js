import express from 'express';
import {
  generateQuiz,
  recordQuizResult,
  getFlashcards,
  getWeakTopics,
} from '../controllers/quizController.js';
import { quizRateLimiter } from '../middleware/rateLimiter.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/quiz/generate - Generate flashcards & questions for a topic
router.post('/generate', quizRateLimiter, authMiddleware, generateQuiz);

// POST /api/quiz/result - Record whether student answered correctly or incorrectly
router.post('/result', authMiddleware, recordQuizResult);

// GET /api/quiz/flashcards - Get all flashcards with filters
router.get('/flashcards', authMiddleware, getFlashcards);

// GET /api/quiz/weak-topics - Weak-topic detection algorithm based on quiz performance
router.get('/weak-topics', authMiddleware, getWeakTopics);

export default router;
