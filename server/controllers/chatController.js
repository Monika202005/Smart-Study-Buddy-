import ChatMessageModel from '../models/ChatMessage.js';
import { processChatMessage } from '../services/chatbotService.js';

/**
 * POST /api/chat
 * Handles student question, injects planner context, handles tool calls, logs history
 */
export async function handleChatMessage(req, res) {
  try {
    const { message } = req.body || {};
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (trimmed.length > 2000) {
      return res.status(400).json({
        error: 'Message exceeds maximum limit of 2,000 characters. Please shorten your query.',
      });
    }

    // Save student's message
    await ChatMessageModel.create({
      userId,
      role: 'user',
      content: trimmed,
      toolCalls: [],
      createdAt: new Date(),
    });

    // Process through chatbot engine (with Planner Context & Tools)
    const result = await processChatMessage({ userId, message: trimmed });

    // Save assistant response message
    const assistantMsg = await ChatMessageModel.create({
      userId,
      role: 'assistant',
      content: result.reply,
      toolCalls: result.toolCalls || [],
      createdAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      reply: result.reply,
      toolCalls: result.toolCalls || [],
      messageId: assistantMsg._id.toString(),
      timestamp: assistantMsg.createdAt,
      aiMode: Boolean(process.env.GEMINI_API_KEY) ? 'Gemini' : 'Offline tutor',
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Internal server error while processing study chat.',
      reply: '⚠️ I encountered a temporary hiccup processing your request. Please try asking again!',
    });
  }
}

/**
 * GET /api/chat/history
 * Retrieves chat history with pagination support
 */
export async function getChatHistory(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const before = req.query.before;

    const query = { userId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    messages.reverse();

    const formatted = messages.map((m) => ({
      ...m,
      id: m._id.toString(),
      _id: m._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      messages: formatted,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ success: false, error: 'Could not load chat history.' });
  }
}

/**
 * DELETE /api/chat/history
 * Clears chat history for current user session
 */
export async function clearChatHistory(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    await ChatMessageModel.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({ success: false, error: 'Could not clear chat history.' });
  }
}
