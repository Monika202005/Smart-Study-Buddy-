# 🎓 StudyBuddy — Smart Study Planner & AI Tutor

> Full Stack Web Development Project | Team of 4 | 6-Week Plan  
> **Lead by Member A (Monika Sharma)**: AI Chatbot, Tool Actions, Flashcards & Quiz Engine, App Shell & Integration.

---

## 🌟 Overview
**StudyBuddy** is a full-stack academic study assistant engineered for university students. Unlike static calendar apps or general AI chatbots, StudyBuddy combines:
1. **Context-Aware AI Study Tutor**: Knows your upcoming exam dates, daily tasks, and weak topics without prompt repetition.
2. **Deterministic Tool Actions**: The model can fetch today's plan, create study tasks, reschedule overdue work, and generate flashcards.
3. **Interactive Flashcards & Quiz Mode**: 3D flip card active recall, multiple-choice quizzes, confetti celebration, and automated weak-topic detection.
4. **App Shell & Floating Assistant**: A global floating chat widget accessible from any view in the app.
5. **Algorithmic Study Planning & Analytics (Teammate Modules)**: Study scheduling and focus tracking designed around university course syllabi.

---

## 👥 Team Roles & Modules Status

| Member | Role | Modules Owned | Implementation Status |
|---|---|---|---|
| **Member A (Monika - Lead)** | **Team Lead + AI Chatbot & Quiz** | App Shell & Routing, AI Chatbot UI & API, Dynamic Context Builder, 4 Tool Actions with Schema Validation, Flashcards & Quiz Engine with LLM generation, Weak-Topic Detection, Automated Test Suite (31 unit/integration + 21 chat runner tests), CI/CD, Shared API Contract. | **✅ REAL, HARDENED & TESTED** |
| **Member B** | **Backend Core + Scheduler** | Production Auth (JWT verification + bcrypt password hashing), Mongoose models (User, Subject, Topic, Task, Session), Greedy auto-schedule algorithm, Reminders (node-cron + Nodemailer). | *Contract & Stubs Ready (Mock store active)* |
| **Member C** | **Planner UI + Subjects** | Calendar view with drag-and-drop, Subjects & Syllabus management, Plan preview and reschedule modal UI. | *App Shell Mounted (Contract stubs active)* |
| **Member D** | **Dashboard + Analytics** | Dashboard layout, Pomodoro focus timer, Analytics charts (Recharts), Streaks and focus metrics. | *App Shell Mounted (Contract stubs active)* |

---

## ⚖️ Implementation Reality: What is Real vs. Stubbed

To maintain transparency and documentation integrity:

### What is REAL and Fully Implemented (Member A's Slice):
- **AI Study Tutor Engine (`/chat` and API `POST /api/chat`)**: Full LLM integration (Google Gemini) with automatic timeout protection (AbortController, 15s default), single-retry on transient errors (429, 5xx, network drops, timeouts), and zero-500 fallback tutor response.
- **Prompt Isolation & Defense-in-Depth**: Normalized input sanitization (lowercasing, multiple whitespace collapsing, zero-width space stripping), delimited prompt data boundaries (`<<<STUDENT_INPUT>>>`, `<<<PLANNER_CONTEXT>>>`, `<<<TOOL_RESULT>>>`), and system instruction boundaries.
- **Tool Calling Execution**: Tools execute **strictly when the model emits a tool call** (never triggered by raw user text regex). Arguments are strictly validated server-side (`toolValidator.js`) with schema checks, length caps, enum checks, and ISO calendar date validation. Capped at 3 tool iterations per turn.
- **Data Access Repository Layer (`plannerRepository.js`)**: Decoupled data access layer filtering all reads and writes by `userId` (extracted securely from `req.user.userId`).
- **Flashcards & Quiz Engine (`/flashcards` and API `POST /api/quiz/*`)**: LLM-backed question generation with schema validation and curated fallbacks, 3D flip card active recall, quiz scoring, and automated weak-topic aggregation.
- **Global App Shell**: Responsive sidebar, top navbar, theme styling, route transitions, and universal floating chatbot widget with bottom content clearance.
- **Automated Testing & CI**: 31 Jest + Supertest automated tests, 21 real chatbot test runner cases (`server/scripts/run-chat-tests.js`), and GitHub Actions CI workflow.

### What is STUBBED (Awaiting Teammates' Modules):
- **Authentication**: `POST /api/auth/login` and `POST /api/auth/register` return working mock tokens and user objects so the frontend functions seamlessly out-of-the-box. Member B will replace this with real bcrypt hashing and JWT verification.
- **MongoDB Atlas Models**: An in-memory store (`mockPlannerStore.js` via `plannerRepository.js`) is used by default for zero-downtime development and testing. Real Mongoose models for Subject, Topic, Task, and Session will be integrated by Member B.
- **Auto-Scheduler Algorithm**: The backend returns pre-calculated syllabus schedules; Member B will plug in the greedy scheduling algorithm.
- **Calendar & Analytics UI**: Planner and analytics views render interactive previews using contract stubs until Member C and D wire them to real state.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router 7, Lucide Icons, Canvas-Confetti, Zustand.
- **Backend**: Node.js (ESM), Express 4, Express-Rate-Limit, Cors, Dotenv, Supertest, Jest.
- **AI Integration**: Google Gemini 1.5 Flash API with tool calling, AbortController timeout, automatic single-retry, and local smart tutor fallback engine.

---

## 📂 Project Structure

```
studybuddy/
├── client/
│   ├── public/                    # Static assets
│   └── src/
│       ├── components/
│       │   ├── chat/              # ChatInterface, ChatMessageItem, FloatingChatWidget, PromptSuggestions
│       │   ├── flashcards/        # FlashcardDeck (3D flip), QuizMode, WeakTopicsBanner, GenerateQuizModal
│       │   └── layout/            # AppShell, Navbar, Sidebar, TeammateModuleStub
│       ├── pages/                 # DashboardPage, ChatPage, FlashcardsPage, PlannerPage, SubjectsPage, TimerPage, AnalyticsPage, SettingsPage, LoginPage
│       ├── services/api.js        # Frontend API client
│       └── store/useStore.js      # Zustand centralized state
├── server/
│   ├── app.js                     # Express application configuration (exported for tests)
│   ├── server.js                  # Main server listener (Port 5001)
│   ├── config/db.js               # MongoDB connection with in-memory fallback
│   ├── controllers/               # chatController, quizController
│   ├── middleware/                # rateLimiter, authMiddleware
│   ├── models/                    # ChatMessage, FlashcardQuiz, mockPlannerStore
│   ├── routes/                    # chatRoutes, quizRoutes
│   ├── scripts/
│   │   ├── run-chat-tests.js      # Live programmatic test runner for all 21 chatbot test cases
│   │   └── test-llm.js            # LLM connectivity verification script
│   ├── services/
│   │   ├── plannerRepository.js   # Decoupled Data Access Layer (replaces direct store calls)
│   │   ├── toolValidator.js       # Server-side tool schema and date validator
│   │   ├── chatbotService.js      # AI tutor engine, prompt isolation, timeout & retry policy
│   │   ├── chatbotTools.js        # 4 executable tools with LLM flashcard generation
│   │   └── chatbotContext.js      # Dynamic planner context builder
│   └── tests/                     # Jest + Supertest test suite (chat, tools, quiz)
├── docs/
│   ├── api-contract.md            # Formal API contract for teammates
│   ├── chatbot-test-suite.md      # 21-case chatbot test specification
│   ├── chatbot-test-results.md    # Real programmatic test run outputs & evidence
│   ├── MEMBER_1_REPORT.md         # Final project report for Member A (Team Lead)
│   └── team-roles.md              # Team roles and meeting schedule
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Both Server and Client Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### 3. Run Automated Tests
```bash
# Run server Jest test suite (31 tests)
npm test

# Run live chatbot test runner (21 verified cases)
node server/scripts/run-chat-tests.js

# Build client for production
npm run build
```

---

## ⚠️ Known Limitations
1. **In-Memory Store Default**: In the absence of a `MONGODB_URI` connection string in `server/.env`, the backend operates on an in-memory repository. Data persists during the server session but resets upon restart.
2. **Mock Authentication**: While `/api/chat` and `/api/quiz` strictly authenticate via `req.user.userId` from `authMiddleware`, full JWT cryptographic verification and bcrypt password hashing await Member B's integration.
3. **LLM Key Optionality**: If no `GEMINI_API_KEY` is configured, StudyBuddy seamlessly invokes the local smart study tutor engine. No 500 errors occur, but live generative reasoning requires a valid Gemini API key.

---

## 🔌 Integration Notes for Teammates

### For Member B (Backend Core & Database):
- **Swapping MongoDB for Mock Store**: You do **NOT** need to edit `chatbotService.js` or `chatbotTools.js`. Simply update **`server/services/plannerRepository.js`** to replace `mockPlannerStore` calls with your Mongoose models:
  - `getTodayTasks(userId)`
  - `getMissedTasks(userId)`
  - `addTask(userId, taskData)`
  - `rescheduleOverdue(userId)`
  - `getExams(userId, days)`
- **Authentication**: Connect your JWT verification inside `server/middleware/authMiddleware.js`. Set `req.user = { userId: decoded.id, ... }`. The chatbot and quiz controllers will automatically inherit real user IDs.

### For Member C (Planner UI & Subjects):
- Wire your drag-and-drop calendar and subject creation forms to the endpoints defined in [`docs/api-contract.md`](file:///Users/monika/fsd%20project/docs/api-contract.md).
- Replace `TeammateModuleStub` on `/planner` and `/subjects` with your production views.

### For Member D (Dashboard & Analytics):
- Replace `TeammateModuleStub` on `/timer` and `/analytics` with your Pomodoro focus timer and Recharts analytics dashboards.
- Connect to `/api/analytics/summary` as specified in the API contract.
