import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User.js';

/**
 * Creates a test user in MongoDB and generates a valid JWT Bearer token
 */
export async function createTestUser(overrides = {}) {
  const email = overrides.email || `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@example.com`;
  const password = overrides.password || 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name: overrides.name || 'Test Student',
    email,
    passwordHash,
    dailyHours: overrides.dailyHours ?? 4,
    theme: overrides.theme || 'dark',
    streak: overrides.streak || 0,
  });

  const secret = process.env.JWT_SECRET || 'studybuddy_secret_jwt_fallback_key_2026';
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    secret,
    { expiresIn: '7d' }
  );

  return {
    user,
    userId: user._id.toString(),
    name: user.name,
    email,
    password,
    token,
    authHeader: `Bearer ${token}`,
  };
}

