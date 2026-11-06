import mongoose from 'mongoose';

const flashcardQuizSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subjectId: {
      type: String,
      default: '',
    },
    subjectName: {
      type: String,
      default: '',
    },
    topicId: {
      type: String,
      default: '',
    },
    topicName: {
      type: String,
      default: '',
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      default: '',
    },
    lastResult: {
      type: String,
      enum: ['correct', 'incorrect', 'untested'],
      default: 'untested',
    },
    difficulty: {
      type: mongoose.Schema.Types.Mixed,
      default: 2,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

flashcardQuizSchema.index({ userId: 1, subjectId: 1 });
flashcardQuizSchema.index({ userId: 1, lastResult: 1 });

const FlashcardQuizModel = mongoose.models.FlashcardQuiz || mongoose.model('FlashcardQuiz', flashcardQuizSchema);
export default FlashcardQuizModel;
