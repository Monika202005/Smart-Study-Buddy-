import UserModel, { memoryUsers, hashPassword } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { getDBStatus } from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/register
 * Register a new university student account (Member B)
 */
export async function register(req, res) {
  try {
    const { name, email, password, dailyHours = 4, theme = 'dark' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = name.trim();

    // Check existing
    let existingUser = null;
    if (getDBStatus().connected) {
      existingUser = await UserModel.findOne({ email: emailClean });
    } else {
      existingUser = memoryUsers.find(u => u.email.toLowerCase() === emailClean);
    }

    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Hash password using bcrypt
    const passwordHash = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUserObj = {
      _id: userId,
      id: userId,
      name: nameClean,
      email: emailClean,
      passwordHash,
      dailyHours: Math.min(Math.max(Number(dailyHours) || 4, 1), 16),
      theme,
      streak: 1,
      createdAt: new Date(),
    };

    // Save to memory
    memoryUsers.push(newUserObj);

    // Save to MongoDB if connected
    if (getDBStatus().connected) {
      try {
        await UserModel.create(newUserObj);
      } catch (dbErr) {
        console.warn('MongoDB save error in register, persisted in memory:', dbErr.message);
      }
    }

    const token = generateToken({
      id: newUserObj._id,
      userId: newUserObj._id,
      email: newUserObj.email,
      name: newUserObj.name,
    });

    const userResponse = {
      id: newUserObj._id,
      _id: newUserObj._id,
      name: newUserObj.name,
      email: newUserObj.email,
      dailyHours: newUserObj.dailyHours,
      theme: newUserObj.theme,
      streak: newUserObj.streak,
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
}

/**
 * POST /api/auth/login
 * Authenticate student credentials & return JWT (Member B)
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();

    let user = null;
    if (getDBStatus().connected) {
      user = await UserModel.findOne({ email: emailClean });
    } else {
      user = memoryUsers.find(u => u.email.toLowerCase() === emailClean);
    }

    // If demo/offline default user login
    if (!user && (emailClean === 'monika@studybuddy.dev' || emailClean === 'student@studybuddy.dev')) {
      user = memoryUsers[0];
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Verify password with bcrypt (or allow demo dev fallback password)
    const passwordMatch = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash).catch(() => false)
      : false;

    const isDemoPassword = password === 'studybuddy2026' || password === 'password123';

    if (!passwordMatch && !isDemoPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user._id || user.id,
      userId: user._id || user.id,
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        dailyHours: user.dailyHours || 4,
        theme: user.theme || 'dark',
        streak: user.streak || 1,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
}

/**
 * GET /api/auth/me
 * Return current user profile details (Member B)
 */
export async function getMe(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';

    let user = null;
    if (getDBStatus().connected) {
      user = await UserModel.findById(userId).select('-passwordHash');
    } else {
      user = memoryUsers.find(u => (u._id || u.id) === userId) || memoryUsers[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        dailyHours: user.dailyHours || 4,
        theme: user.theme || 'dark',
        streak: user.streak || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch user profile.' });
  }
}

/**
 * PUT /api/auth/profile
 * Update user settings (daily hours, theme, name) (Member B)
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { dailyHours, theme, name } = req.body;

    const updateFields = {};
    if (dailyHours !== undefined) updateFields.dailyHours = Math.min(Math.max(Number(dailyHours), 1), 16);
    if (theme && ['dark', 'light'].includes(theme)) updateFields.theme = theme;
    if (name && name.trim()) updateFields.name = name.trim();

    let updatedUser = null;
    if (getDBStatus().connected) {
      updatedUser = await UserModel.findByIdAndUpdate(userId, updateFields, { new: true }).select('-passwordHash');
    }

    // Always update memory store
    const memUser = memoryUsers.find(u => (u._id || u.id) === userId) || memoryUsers[0];
    Object.assign(memUser, updateFields);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser || memUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not update profile.' });
  }
}
