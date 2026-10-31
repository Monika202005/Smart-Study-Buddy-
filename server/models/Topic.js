import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      maxlength: 120,
    },
    difficulty: {
      type: Number,
      required: true,
      enum: [1, 2, 3], // 1 = easy, 2 = medium, 3 = hard
      default: 2,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    estimatedHours: {
      type: Number,
      required: true,
      default: 2,
      min: [0.5, 'Estimated hours must be at least 0.5'],
      max: [20, 'Estimated hours cannot exceed 20'],
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes
topicSchema.index({ userId: 1, subjectId: 1, status: 1 });

const TopicModel = mongoose.models.Topic || mongoose.model('Topic', topicSchema);
export default TopicModel;
