import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDBStatus } from './config/db.js';
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
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// ==========================================
// SECURITY & MIDDLEWARE (Member B & Lead)
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: false, // allow frontend scripts in dev
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Development request logger
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Root & Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    app: 'StudyBuddy API',
    aiMode: hasGeminiKey ? 'Gemini' : 'Offline tutor',
    llmModel: process.env.LLM_MODEL || 'gemini-1.5-flash',
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
app.use('/api/user', userRoutes);

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

export default app;
