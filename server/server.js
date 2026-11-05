import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5001;

// Initialize database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 StudyBuddy Server running on port ${PORT} (http://localhost:${PORT})`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Member 1 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`🧠 Member 1 Quiz API: http://localhost:${PORT}/api/quiz/flashcards`);
  });
});
