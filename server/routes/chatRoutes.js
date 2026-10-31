import express from 'express';
import { handleChatMessage, getChatHistory, clearChatHistory } from '../controllers/chatController.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/chat - Process student chat with Planner Context, LLM, and Tool Calling
router.post('/', chatRateLimiter, authMiddleware, handleChatMessage);

// GET /api/chat/history - Retrieve conversation history with pagination
router.get('/history', authMiddleware, getChatHistory);

// DELETE /api/chat/history - Reset current conversation
router.delete('/history', authMiddleware, clearChatHistory);

export default router;
