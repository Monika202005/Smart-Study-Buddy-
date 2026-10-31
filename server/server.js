import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDBStatus } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import {
  mockUser,
  mockSubjects,
  mockTasks,
  getTodayTasks,
  getExamsNext14Days,
  rescheduleOverdueTasks,
} from './models/mockPlannerStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Request logger for development
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
      member2_backend_scheduler: 'STUB_READY',
      member3_planner_subjects: 'STUB_READY',
      member4_dashboard_analytics: 'STUB_READY',
    },
    timestamp: new Date(),
  });
});

// ==========================================
// MEMBER 1 MODULES: Chatbot, Tools, Quiz API
// ==========================================
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);

// ==========================================
// INTEGRATION CONTRACT STUBS FOR TEAMMATES
// (Provides mock data so frontend works immediately)
// ==========================================

// Member B Stub: Auth API
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'mock_jwt_token_studybuddy_monika',
    user: mockUser,
  });
});
app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, user: mockUser });
});

// Member B & C Stub: Subjects API
app.get('/api/subjects', (req, res) => {
  res.json({ success: true, count: mockSubjects.length, subjects: mockSubjects });
});

// Member B & C Stub: Tasks API
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, count: mockTasks.length, tasks: mockTasks });
});
app.patch('/api/tasks/:id/complete', (req, res) => {
  const task = mockTasks.find(t => t.id === req.params.id);
  if (task) {
    task.completed = !task.completed;
    return res.json({ success: true, task });
  }
  res.status(404).json({ error: 'Task not found' });
});

// Member B & C Stub: Planner API
app.post('/api/planner/generate', (req, res) => {
  res.json({
    success: true,
    message: 'Auto-generated study plan calculated successfully from syllabus and exam countdowns.',
    plan: {
      generatedFor: mockUser.name,
      dailyHours: mockUser.dailyHours,
      tasksScheduled: mockTasks.length,
    },
  });
});
app.post('/api/planner/reschedule-missed', (req, res) => {
  const result = rescheduleOverdueTasks();
  res.json({
    success: true,
    message: `Rescheduled ${result.rescheduledCount} overdue task(s).`,
    ...result,
  });
});

// Member D Stub: Analytics API
app.get('/api/analytics/summary', (req, res) => {
  res.json({
    success: true,
    summary: {
      totalStudyHoursThisWeek: 16.5,
      streakDays: 4,
      completionRatePercent: 78,
      hoursBySubject: [
        { subject: 'Data Structures', hours: 7.5 },
        { subject: 'DBMS', hours: 5.0 },
        { subject: 'Operating Systems', hours: 4.0 },
      ],
    },
  });
});

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

// Initialize database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 StudyBuddy Server running on port ${PORT} (http://localhost:${PORT})`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Member 1 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`🧠 Member 1 Quiz API: http://localhost:${PORT}/api/quiz/flashcards`);
  });
});
