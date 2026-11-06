import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    taskId: {
      type: String,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    remindAt: {
      type: Date,
      required: [true, 'Reminder time is required'],
      index: true,
    },
    sent: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound index
reminderSchema.index({ sent: 1, remindAt: 1 });
reminderSchema.index({ userId: 1, remindAt: 1 });

// In-memory store fallback
export const memoryReminders = [
  {
    _id: 'rem_1',
    userId: 'default_student_1',
    taskId: 'task_1',
    title: 'Review AVL Tree Rotations before evening focus block',
    email: 'monika@studybuddy.dev',
    remindAt: new Date(Date.now() + 3600 * 1000 * 2), // 2 hours from now
    sent: false,
    status: 'pending',
    createdAt: new Date(),
  },
];

const ReminderModel = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
export default ReminderModel;
