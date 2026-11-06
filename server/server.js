import app from './app.js';
import { connectDB } from './config/db.js';
import { startReminderCronJob } from './jobs/reminderJob.js';

const PORT = process.env.PORT || 5001;

// Initialize database, Start Server & Reminder Cron Job
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StudyBuddy Server running on port ${PORT} (http://localhost:${PORT})`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Member 1 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`🧠 Member 1 Quiz API: http://localhost:${PORT}/api/quiz/flashcards`);
    console.log(`🔐 Member B Auth API: http://localhost:${PORT}/api/auth/login`);
    console.log(`📅 Member B Planner API: http://localhost:${PORT}/api/planner/generate`);

    // Start Member B background cron scheduler for reminders
    startReminderCronJob();
  });
});

export default app;
