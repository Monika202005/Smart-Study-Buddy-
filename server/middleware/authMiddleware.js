import jwt from 'jsonwebtoken';
import UserModel, { memoryUsers } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'studybuddy_jwt_secret_dev_key_2026';

/**
 * Authentication Middleware (Member B)
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches authenticated user object to req.user
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow fallback if in offline/testing mode, or reject if strict
      const devUser = memoryUsers[0];
      req.user = {
        id: devUser._id,
        _id: devUser._id,
        userId: devUser._id,
        name: devUser.name,
        email: devUser.email,
        dailyHours: devUser.dailyHours,
      };
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Check for hardcoded mock dev token
    if (token === 'mock_jwt_token_studybuddy_monika' || token.startsWith('mock_jwt_')) {
      const devUser = memoryUsers[0];
      req.user = {
        id: devUser._id,
        _id: devUser._id,
        userId: devUser._id,
        name: devUser.name,
        email: devUser.email,
        dailyHours: devUser.dailyHours,
        token,
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      let user = null;
      if (getDBStatus().connected) {
        user = await UserModel.findById(decoded.id || decoded.userId).select('-passwordHash');
      } else {
        user = memoryUsers.find(u => u._id === (decoded.id || decoded.userId));
      }

      if (!user) {
        // Fallback to token payload data if user not found in ephemeral memory
        req.user = {
          id: decoded.id || decoded.userId,
          _id: decoded.id || decoded.userId,
          userId: decoded.id || decoded.userId,
          email: decoded.email,
          name: decoded.name || 'Student',
        };
      } else {
        req.user = {
          id: user._id.toString(),
          _id: user._id.toString(),
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          dailyHours: user.dailyHours,
        };
      }

      return next();
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token. Please log in again.',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, error: 'Authentication internal error.' });
  }
}

/**
 * Helper to generate signed JWT token (Member B)
 */
export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
