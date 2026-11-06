import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    dailyHours: {
      type: Number,
      default: 4,
      min: [1, 'Daily hours must be at least 1'],
      max: [16, 'Daily hours cannot exceed 16'],
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    streak: {
      type: Number,
      default: 1,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes are automatically created by unique: true on email

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Password hashing helper
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}

// In-memory user store fallback for zero-downtime offline testing
export const memoryUsers = [
  {
    _id: 'default_student_1',
    id: 'default_student_1',
    name: 'Monika Sharma',
    email: 'monika@studybuddy.dev',
    // bcrypt hash of 'studybuddy2026'
    passwordHash: '$2a$10$Oclw86N51Z7vD8YgO0bZ6u3rJtH5eS8C5m1n8zX4iO0nL4wYk7jO.',
    dailyHours: 4,
    theme: 'dark',
    streak: 4,
    createdAt: new Date('2026-10-01T08:00:00.000Z'),
  },
];

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;
