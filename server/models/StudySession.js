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
      type: String,
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

studySessionSchema.index({ userId: 1, date: 1 });

const StudySessionModel = mongoose.models.StudySession || mongoose.model('StudySession', studySessionSchema);
export default StudySessionModel;
