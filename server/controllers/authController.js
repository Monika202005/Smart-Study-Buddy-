import { z } from 'zod';
import UserModel, { hashPassword } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  dailyHours: z.coerce.number().min(1).max(16).optional().default(2),
  theme: z.enum(['dark', 'light']).optional().default('dark'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  dailyHours: z.coerce.number().min(1).max(16).optional(),
  theme: z.enum(['dark', 'light']).optional(),
});

/**
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues?.[0]?.message || parseResult.error.errors?.[0]?.message || 'Invalid registration data.';
      return res.status(400).json({
        success: false,
        error: errorMsg,
      });
    }

    const { name, email, password, dailyHours, theme } = parseResult.data;
    const emailClean = email.toLowerCase();

    // Check duplicate email
    const existingUser = await UserModel.findOne({ email: emailClean });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'This email address is already registered. Please sign in or use a different email.',
      });
    }

    // Hash password with bcrypt cost 10+
    const passwordHash = await hashPassword(password);

    const newUser = await UserModel.create({
      name,
      email: emailClean,
      passwordHash,
      dailyHours: dailyHours || 2,
      theme: theme || 'dark',
      streak: 0,
    });

    const token = generateToken({
      id: newUser._id.toString(),
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id.toString(),
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        dailyHours: newUser.dailyHours,
        theme: newUser.theme,
        streak: newUser.streak,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues?.[0]?.message || parseResult.error.errors?.[0]?.message || 'Email and password are required.';
      return res.status(400).json({
        success: false,
        error: errorMsg,
      });
    }

    const { email, password } = parseResult.data;
    const emailClean = email.toLowerCase();

    const user = await UserModel.findOne({ email: emailClean });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const passwordMatch = await user.comparePassword(password).catch(() => false);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        dailyHours: user.dailyHours,
        theme: user.theme,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const user = await UserModel.findById(userId).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        dailyHours: user.dailyHours,
        theme: user.theme,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
  }
}

/**
 * GET /api/user/profile
 */
export async function getProfile(req, res) {
  return getMe(req, res);
}

/**
 * PUT /api/user/profile
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const parseResult = profileUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues?.[0]?.message || parseResult.error.errors?.[0]?.message || 'Invalid profile data.';
      return res.status(400).json({
        success: false,
        error: errorMsg,
      });
    }

    const { name, dailyHours, theme } = parseResult.data;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dailyHours !== undefined) updateData.dailyHours = dailyHours;
    if (theme !== undefined) updateData.theme = theme;

    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        dailyHours: user.dailyHours,
        theme: user.theme,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}
