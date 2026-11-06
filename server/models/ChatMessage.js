import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    toolCalls: [
      {
        tool: String,
        arguments: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ userId: 1, createdAt: 1 });

const ChatMessageModel = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessageModel;
