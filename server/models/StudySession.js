import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
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
    subjectId: {
      type: String,
      default: null,
      index: true,
    },
    subjectName: {
      type: String,
      default: '',
    },
    durationMin: {
      type: Number,
      required: true,
      min: [1, 'Session duration must be at least 1 minute'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound index for analytics querying
studySessionSchema.index({ userId: 1, date: 1 });

// In-memory sessions store fallback
export const memoryStudySessions = [
  {
    _id: 'sess_1',
    userId: 'default_student_1',
    taskId: 'task_2',
    subjectId: 'cs301',
    subjectName: 'Data Structures & Algorithms',
    durationMin: 50,
    date: new Date().toISOString().split('T')[0],
    notes: 'Completed Graph BFS/DFS study module',
  },
  {
    _id: 'sess_2',
    userId: 'default_student_1',
    taskId: 'task_3',
    subjectId: 'cs302',
    subjectName: 'Database Management Systems',
    durationMin: 45,
    date: new Date().toISOString().split('T')[0],
    notes: 'B+ Tree indexing deep dive',
  },
];

const StudySessionModel = mongoose.models.StudySession || mongoose.model('StudySession', studySessionSchema);
export default StudySessionModel;
