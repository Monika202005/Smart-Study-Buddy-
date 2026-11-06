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
| **Member 1 (Monika - Lead)** | **Team Lead + AI Chatbot & Quiz** | App Shell & Routing, AI Chatbot UI & API, Dynamic Context Builder, 4 Tool Actions with Schema Validation, Flashcards & Quiz Engine with LLM generation, Weak-Topic Detection, Automated Test Suite (31 unit/integration + 21 chat runner + 4 smoke tests), CI/CD, Shared API Contract. | **✅ REAL, HARDENED & TESTED** |
| **Member 2 (Member B)** | **Backend Core + Scheduler** | Auth APIs (JWT + bcrypt), Mongoose models (User, Subject, Topic, Task, Session, Reminder), Greedy auto-schedule algorithm, Reminders (node-cron + Nodemailer). | **✅ COMPLETE & TESTED** |
| **Member 3 (Member C)** | **Planner UI + Subjects** | Landing page, Login/Signup forms, Planner calendar with drag-and-drop, Subjects & Syllabus management, plan preview, reschedule modal, task CRUD. | **✅ COMPLETE & TESTED** |
| **Member 4 (Member D)** | **Dashboard + Analytics** | Dashboard layout, Pomodoro focus timer, Analytics charts (Recharts), streaks, dark mode pass. | *App Shell Ready* |

---

## ⚖️ Implementation Reality: What is Real vs. Stubbed

To maintain transparency and documentation integrity:

### What is REAL and Fully Implemented (Member 1 / Lead Slice):
- **AI Study Tutor Engine (`/chat` and API `POST /api/chat`)**: Full LLM integration (Google Gemini) with automatic timeout protection (AbortController, 15s default), single-retry on transient errors (429, 5xx, network drops, timeouts), and zero-500 fallback tutor response.
- **Prompt Isolation & Defense-in-Depth**: Normalized input sanitization (lowercasing, multiple whitespace collapsing, zero-width space stripping), delimited prompt data boundaries (`<<<STUDENT_INPUT>>>`, `<<<PLANNER_CONTEXT>>>`, `<<<TOOL_RESULT>>>`), and system instruction boundaries.
- **Tool Calling Execution**: Tools execute **strictly when the model emits a tool call** (never triggered by raw user text regex). Arguments are strictly validated server-side (`toolValidator.js`) with schema checks, length caps, enum checks, and ISO calendar date validation. Capped at 3 tool iterations per turn.
- **Data Access Repository Layer (`plannerRepository.js`)**: Decoupled data access layer filtering all reads and writes by `userId` (extracted securely from `req.user.userId`).
- **Flashcards & Quiz Engine (`/flashcards` and API `POST /api/quiz/*`)**: LLM-backed question generation with schema validation and curated fallbacks, 3D flip card active recall, quiz scoring, and automated weak-topic aggregation.
- **Global App Shell**: Responsive sidebar, top navbar, theme styling, route transitions, and universal floating chatbot widget with bottom content clearance.
- **Automated Testing & CI**: 31 Jest + Supertest automated tests, 4 Vitest client smoke tests, 21 real chatbot test runner cases (`server/scripts/run-chat-tests.js`), and GitHub Actions CI workflow.

### Teammate Implementations Integrated:
- **Member 2 (Backend & Scheduler)**: Real bcrypt password hashing and JWT token verification (`server/controllers/authController.js`), Mongoose schemas (`server/models/`), greedy auto-schedule algorithm (`server/services/schedulerService.js`), and cron reminders (`server/jobs/reminderJob.js`).
- **Member 3 (Planner UI & Subjects)**: Interactive monthly/weekly planner calendar with drag-and-drop (`PlannerCalendar.jsx`), task details & reschedule modal (`TaskDetailModal.jsx`), subject and topic CRUD modals (`AddSubjectModal.jsx`, `AddTopicModal.jsx`), and marketing landing page (`LandingPage.jsx`).

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
│       │   ├── planner/           # PlannerCalendar (drag-and-drop), TaskDetailModal (reschedule)
│       │   ├── subjects/          # AddSubjectModal, AddTopicModal
│       │   └── layout/            # AppShell, Navbar, Sidebar, TeammateModuleStub
│       ├── pages/                 # LandingPage, DashboardPage, ChatPage, FlashcardsPage, PlannerPage, SubjectsPage, TimerPage, AnalyticsPage, SettingsPage, LoginPage
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
│   ├── MEMBER_1_REPORT.md         # Final project report for Member 1 (Team Lead)
│   ├── MEMBER_B_REPORT.md         # Final report chapters owned by Member B
│   ├── MEMBER_C_REPORT.md         # Final report chapters owned by Member C (Planner UI & Subjects)
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
