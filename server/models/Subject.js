import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex color code'],
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance index
subjectSchema.index({ userId: 1, examDate: 1 });

const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default SubjectModel;
