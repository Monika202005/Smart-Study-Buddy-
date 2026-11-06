import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Authentication token required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing.',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV !== 'test') {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: JWT_SECRET missing.',
      });
    }
    const effectiveSecret = secret || 'test_jwt_secret_studybuddy';

    let decoded;
    try {
      decoded = jwt.verify(token, effectiveSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error:
          err.name === 'TokenExpiredError'
            ? 'Token has expired. Please log in again.'
            : 'Invalid authentication token.',
      });
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload: missing user identifier.',
      });
    }

    req.user = {
      id: userId.toString(),
      _id: userId.toString(),
      userId: userId.toString(),
      email: decoded.email,
      name: decoded.name || 'Student',
    };

    // If UserModel is connected, fetch full user to verify existence & attach profile properties
    try {
      const userDoc = await UserModel.findById(userId).select('-passwordHash').lean();
      if (userDoc) {
        req.user.name = userDoc.name;
        req.user.email = userDoc.email;
        req.user.dailyHours = userDoc.dailyHours ?? 2;
        req.user.theme = userDoc.theme || 'dark';
        req.user.streak = userDoc.streak ?? 0;
      }
    } catch (_) {
      // Continue with decoded claims if DB lookup throws
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed due to internal error.',
    });
  }
}

export function generateToken(payload, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_studybuddy' : null);
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environment.');
  }
  return jwt.sign(
    {
      id: payload.id || payload._id || payload.userId,
      userId: payload.id || payload._id || payload.userId,
      email: payload.email,
      name: payload.name,
    },
    secret,
    { expiresIn }
  );
}
