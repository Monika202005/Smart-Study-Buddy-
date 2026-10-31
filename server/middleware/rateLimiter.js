import rateLimit from 'express-rate-limit';

/**
 * Chat Rate Limiter:
 * Prevents spamming, resource exhaustion, and keeps LLM cost bounded.
 * Allows max 30 chat messages per minute per IP.
 */
export const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Rate limit exceeded: You have sent too many study messages. Please wait 1 minute before asking more questions.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Quiz generation limiter:
 * Allows max 20 generations per minute.
 */
export const quizRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many quiz generation requests. Please wait a moment.',
  },
});
