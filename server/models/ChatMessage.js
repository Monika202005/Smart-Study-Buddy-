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

// Fallback in-memory storage for development when Mongo is offline
export const memoryChatMessages = [
  {
    _id: 'msg_init_1',
    userId: 'default_student_1',
    role: 'assistant',
    content: "👋 Hello Monika! I'm **StudyBuddy AI**, your smart personal study tutor and planner assistant.\n\nI can help you:\n- 📖 Explain complex concepts simply with analogies\n- 📅 Tell you what to focus on today based on upcoming exams\n- 🔄 Reschedule missed tasks or create new study goals\n- 🧠 Quiz you or generate flashcards on any topic\n\nWhat would you like to review today?",
    toolCalls: [],
    createdAt: new Date(Date.now() - 3600000),
  },
];

let ChatMessageModel;
try {
  ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);
} catch (e) {
  ChatMessageModel = mongoose.models.ChatMessage;
}

export default ChatMessageModel;
