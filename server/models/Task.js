import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subjectId: {
      type: String,
      required: true,
      index: true,
    },
    subjectName: {
      type: String,
      default: '',
    },
    topicId: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['study', 'assignment', 'exam', 'revision'],
      default: 'study',
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    scheduledDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    durationHours: {
      type: Number,
      default: 2,
      min: 0.25,
      max: 12,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isRescheduled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes as required in Section 6
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, scheduledDate: 1, completed: 1 });

const TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default TaskModel;
