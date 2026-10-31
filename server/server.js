import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDBStatus } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import { startReminderCronJob } from './jobs/reminderJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// SECURITY & MIDDLEWARE (Member B)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false, // allow frontend scripts in dev
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Development request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root & Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'StudyBuddy API',
    database: getDBStatus(),
    modules: {
      member1_chatbot_quiz: 'ACTIVE',
      member2_backend_scheduler: 'ACTIVE',
      member3_planner_subjects: 'ACTIVE',
      member4_dashboard_analytics: 'ACTIVE',
    },
    cronJob: 'RUNNING',
    timestamp: new Date(),
  });
});

// ==========================================
// MEMBER 1 MODULES: Chatbot, Tools, Quiz API
// ==========================================
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);

// ==========================================
// MEMBER B MODULES: Auth, Subjects, Tasks, Planner, Sessions, Analytics, Reminders
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

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
