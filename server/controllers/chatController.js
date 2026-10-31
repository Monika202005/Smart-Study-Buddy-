import ChatMessageModel, { memoryChatMessages } from '../models/ChatMessage.js';
import { processChatMessage } from '../services/chatbotService.js';
import { getDBStatus } from '../config/db.js';

/**
 * POST /api/chat
 * Handles student question, injects planner context, handles tool calls, logs history
 */
export async function handleChatMessage(req, res) {
  try {
    const { message, userId = 'default_student_1' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Save student's user message
    const userMsgObj = {
      _id: `msg_u_${Date.now()}`,
      userId,
      role: 'user',
      content: message.trim(),
      toolCalls: [],
      createdAt: new Date(),
    };

    memoryChatMessages.push(userMsgObj);
    if (getDBStatus().connected) {
      try {
        await ChatMessageModel.create(userMsgObj);
      } catch (err) {
        console.warn('Could not persist to MongoDB, stored in memory:', err.message);
      }
    }

    // Process through chatbot engine (with Planner Context & Tools)
    const result = await processChatMessage({ userId, message });

    // Save assistant response message
    const assistantMsgObj = {
      _id: `msg_a_${Date.now()}`,
      userId,
      role: 'assistant',
      content: result.reply,
      toolCalls: result.toolCalls || [],
      createdAt: new Date(),
    };

    memoryChatMessages.push(assistantMsgObj);
    if (getDBStatus().connected) {
      try {
        await ChatMessageModel.create(assistantMsgObj);
      } catch (err) {
        console.warn('Could not persist to MongoDB, stored in memory:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      reply: result.reply,
      toolCalls: result.toolCalls,
      messageId: assistantMsgObj._id,
      timestamp: assistantMsgObj.createdAt,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while processing study chat.',
      reply: "⚠️ I encountered a temporary hiccup processing your request. Please try asking again!",
    });
  }
}

/**
 * GET /api/chat/history
 * Retrieves chat history with pagination support
 */
export async function getChatHistory(req, res) {
  try {
    const userId = req.query.userId || 'default_student_1';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const before = req.query.before;

    let messages = [];

    if (getDBStatus().connected) {
      try {
        const query = { userId };
        if (before) {
          query.createdAt = { $lt: new Date(before) };
        }
        messages = await ChatMessageModel.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        messages.reverse();
      } catch (err) {
        console.warn('MongoDB history query failed, falling back to memory store:', err.message);
      }
    }

    if (messages.length === 0) {
      messages = memoryChatMessages.filter(m => m.userId === userId);
      if (before) {
        const beforeDate = new Date(before);
        messages = messages.filter(m => new Date(m.createdAt) < beforeDate);
      }
      messages = messages.slice(-limit);
    }

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
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
    const userId = req.query.userId || 'default_student_1';

    // Clear from memory
    const initialGreeting = memoryChatMessages.find(m => m._id === 'msg_init_1');
    memoryChatMessages.length = 0;
    if (initialGreeting) {
      memoryChatMessages.push(initialGreeting);
    }

    if (getDBStatus().connected) {
      try {
        await ChatMessageModel.deleteMany({ userId });
      } catch (e) {
        // silent fallback
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not clear chat history.' });
  }
}
