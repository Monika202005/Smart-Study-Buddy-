# 🎓 StudyBuddy — Smart Multi-User Academic Planner & AI Tutor

> A Real Multi-User Web Application engineered for university students.
> Featuring dedicated public landing, student authentication, private workspaces with zero cross-tenant data leakage, pure algorithmic exam scheduling, real Pomodoro timer logging, Recharts analytics, and Google Gemini AI tutoring with tool calling.

---
## 👥 Contributors & Contributions

| Team Member | Contributions |
|---|---|
| **Monika** | **Team Lead – Full-Stack Development & AI Integration.** Led the subsequent full-stack implementation of StudyBuddy, including MongoDB database architecture, Mongoose models, JWT authentication, password hashing, protected APIs and multi-user data isolation. Implemented the study scheduling algorithm and task-rescheduling logic. Connected frontend modules to persistent backend APIs, replacing mock data. Integrated the Gemini-powered AI assistant with dynamic student context and tool-based actions (`get_today_plan`, `create_task`, `reschedule_missed`, `generate_flashcards`). Also handled dashboard analytics integration, study-session tracking, flashcards, quizzes, deployment configuration, database seeding, testing, CI/CD, security improvements and technical documentation. |
| **Naveena** | Contributed to the initial backend and scheduler prototype, including the initial structure for authentication, database models, task/subject APIs, scheduling and reminders.. |
| **Nethravathi** | Contributed to the initial planner interface and subject-management prototype, including calendar UI, drag-and-drop planning, syllabus management and plan preview interfaces.. |
| **Devika** | Contributed to the initial dashboard prototype, including preliminary dashboard and analytics-interface components. |

### Development & Integration Note

The initial team prototype served as the foundation for the project. The subsequent full-stack implementation, integration of persistent database functionality, AI-powered features, deployment, testing, CI/CD and security improvements were led and implemented by **Monika**.

## 🌟 Overview & System Highlights

StudyBuddy is a full-stack academic study assistant and planner. Unlike generic productivity tools, StudyBuddy is tailored to academic semesters and university exam schedules:

1. **Dedicated Multi-User Authentication**: Public marketing landing page (`/`), secure sign-up (`/signup`) and sign-in (`/login`) with bcrypt password hashing and JWT token management. All student pages are strictly protected under `/app/*` via `ProtectedRoute`.
2. **Strict Multi-Tenant Isolation**: Every student creates their own private workspace. All subjects, syllabus topics, study tasks, flashcards, timer sessions, and analytics are isolated strictly by `userId` at the database and repository layers.
3. **Pure Algorithmic Auto-Scheduler**: Pure greedy scheduling engine that respects student daily capacity caps, prioritizes closer exams, reserves revision buffers 1–2 days before exams, strictly prevents post-exam assignments, and supports interactive preview vs commit workflows (`/api/planner/generate` and `/api/planner/reschedule`).
4. **Context-Aware AI Study Tutor (Google Gemini)**: Real-time LLM integration with function calling (`get_today_plan`, `create_task`, `reschedule_missed`, `generate_flashcards`). Protected by `AbortController` timeouts (15s default), single-retry for transient errors, and zero-500 fallback tutor responses.
5. **Interactive Flashcards & Quiz Engine**: 3D flip card active recall, generative multiple-choice quizzes, answer feedback, and automated weak-topic detection.
6. **Real Pomodoro Focus Timer**: Interactive timer tied to student study tasks, automatically logging completed `StudySession` documents to MongoDB Atlas upon completion.
7. **Recharts Analytics & Streaks**: Live data visualization including 7-day study hours bar chart, subject time distribution pie chart, syllabus progress bars, and consecutive day streak tracking.

---

## 👥 Implementation Reality & Module Coverage

| Module | Features & Implementation | Status |
|---|---|:---:|
| **Authentication & Users** | Real bcrypt hashing, JWT issuance & verification, Zod request validation, `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/user/profile`. | **✅ 100% REAL** |
| **Data Persistence** | Real MongoDB Atlas connection with Mongoose schemas: `User`, `Subject`, `Topic`, `Task`, `StudySession`, `Reminder`, `ChatMessage`, `FlashcardQuiz`. Zero mock arrays in runtime. | **✅ 100% REAL** |
| **Scheduler Engine** | Pure deterministic scheduler with difficulty/urgency weighting, daily hours limits, pre-exam revision buffers, overdue roll-forward, and preview/commit endpoints. | **✅ 100% REAL** |
| **AI Study Tutor** | Google Gemini (`gemini-3.5-flash-lite`) API integration, 4 server-side validated tools, prompt boundary delimiters, defense-in-depth sanitization, 3-iteration loop cap, zero-500 fallback. | **✅ 100% REAL** |
| **Focus Timer** | Pomodoro timer with task selector, custom durations, quick-test mode, and real `StudySession` database persistence on completion. | **✅ 100% REAL** |
| **Analytics Dashboard** | Recharts bar charts, pie charts, syllabus completion progress, daily streak calculation, and summary metrics. | **✅ 100% REAL** |
| **App Shell & UI** | React 19 SPA, Tailwind CSS 4, responsive sidebar & navbar, dark theme, floating AI companion widget, and toast notifications. | **✅ 100% REAL** |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router 7, Recharts, Lucide Icons, Canvas-Confetti, Zustand.
- **Backend**: Node.js (ESM), Express 4, Mongoose 8, Express-Rate-Limit, Helmet, Cors, Zod, BcryptJS, JSONWebToken.
- **Database**: MongoDB Atlas (Managed Cloud Cluster) & MongoDB Memory Server (Isolated Unit Tests).
- **AI Core**: Google Gemini API (`gemini-3.5-flash-lite`), AbortController timeout & retry gateway.
- **Testing**: Jest 30, Vitest 4, Supertest 7, custom 21-case live chat test runner, deployment smoke suite.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0 (Tested on Node 25)
- MongoDB Atlas connection string (or local MongoDB URI)
- Google Gemini API key (optional for smart tutor fallback mode)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/monika-sharma-dev/studybuddy.git
cd studybuddy

# Install root, client, and server dependencies
npm run install:all
```

### 2. Configure Environment Variables
Create `server/.env` based on `server/.env.example`:
```bash
cp server/.env.example server/.env
```
Fill in your configuration:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/studybuddy?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-3.5-flash-lite
LLM_TIMEOUT_MS=15000
```

Create `client/.env` based on `client/.env.example`:
```bash
cp client/.env.example client/.env
```
```env
VITE_API_BASE_URL=http://localhost:5001
```

### 3. Seed the Database
Populate the database with realistic university subjects, topics, tasks, flashcards, and a demo student:
```bash
npm run seed -- --reset
```
*Demo Student Credentials:*
- **Email**: `student@studybuddy.dev`
- **Password**: `password123`

### 4. Start the Application
```bash
# Concurrently starts server (port 5001) and client (port 5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser:
- Visit `/` for public landing page.
- Visit `/login` or `/signup` to authenticate.
- Explore `/app/dashboard`, `/app/planner`, `/app/subjects`, `/app/chat`, `/app/flashcards`, `/app/timer`, and `/app/analytics`.

---

## 🧪 Comprehensive Verification & Test Suites

The repository features comprehensive automated test coverage with 0 mocked test databases:

### 1. Complete Server Test Suite (55 Tests)
Runs 5 distinct test suites in an isolated in-memory MongoDB instance:
```bash
npm run test:server
```
- `tests/realBackend.test.js`: Multi-user auth, session lifecycle, two-user data isolation, analytics calculations, planner preview vs commit.
- `tests/chat.test.js`: Input validation, guardrails, prompt injection blocking, timeout fallback, chat history pagination, rate limiter.
- `tests/quiz.test.js`: Quiz generation, schema validation, answer scoring, weak-topic grouping.
- `tests/tools.test.js`: Tool argument validation (zod/schema), date bounds, userId scoping.
- `tests/scheduler.test.js`: Topic difficulty weighting, exam urgency, daily hours capacity cap, revision buffers, deterministic output.

### 2. Client Vitest Suite (9 Tests)
```bash
npm run test:client
```
Verifies routing, protected route redirects, landing page components, flashcard 3D flips, and quiz interaction.

### 3. Real Chatbot Live Test Runner (21 Tests)
Runs programmatic assertions across all 21 test cases against the live Gemini model:
```bash
npm run test:chat
```
Results are saved to [docs/chatbot-test-results.md](docs/chatbot-test-results.md) (**21 / 21 PASSED**).

### 4. Production Deployment Smoke Test (6 E2E Checks)
```bash
npm run smoke
```
Verifies backend health check, user registration & auth, cross-tenant isolation, planner preview generation, timer session persistence, and chatbot live response.

---

## 📁 Repository Structure

```
studybuddy/
├── client/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Shared UI & modular cards
│   │   │   ├── chatbot/             # AI chat window & floating bubble
│   │   │   ├── layout/              # Sidebar, Navbar, ProtectedRoute
│   │   │   ├── planner/             # Calendar & task modals
│   │   │   ├── quiz/                # Active recall flashcards & quiz
│   │   │   └── subjects/           # Subject & topic management modals
│   │   ├── pages/                   # Application pages (Landing, Login, Dashboard, etc.)
│   │   ├── services/api.js          # Centralized Axios/Fetch API client
│   │   ├── store/useStore.js        # Global Zustand state management
│   │   └── test/                    # Client Vitest integration tests
│   ├── vercel.json                  # Vercel SPA routing rewrite rules
│   └── package.json
├── server/
│   ├── config/db.js                 # Fail-fast MongoDB Atlas connection
│   ├── controllers/                 # Express route controllers (Auth, Chat, Tasks, etc.)
│   ├── middleware/authMiddleware.js # JWT verification & tenant scoping
│   ├── models/                      # Real Mongoose schemas (User, Task, Subject, etc.)
│   ├── routes/                      # Scoped REST API routing modules
│   ├── scripts/                     # Seed script, chat test runner, smoke suite
│   ├── services/                    # Scheduler engine, Gemini gateway, tools repository
│   ├── tests/                       # Jest & Supertest automated test suites
│   └── server.js                    # Express application entrypoint
├── docs/                            # Architecture, API contract, test reports, slides
├── render.yaml                      # Render cloud deployment blueprint
├── vercel.json                      # Vercel monorepo deployment config
└── package.json                     # Root workspace scripts & orchestrator
```

---

## 📜 Documentation Links
- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [System Architecture](docs/architecture.md)
- [Entity-Relationship Diagram](docs/er-diagram.md)
- [API Contract Specification](docs/api-contract.md)
- [Comprehensive Testing Report](docs/testing-report.md)
- [Team Lead Deliverable Report](docs/MEMBER_1_REPORT.md)
- [Presentation Demo Script](docs/demo-script.md)
- [Slides Outline](docs/slides-outline.md)
- [Screenshot Checklist](docs/screenshot-checklist.md)
- [Contribution Summary](docs/contribution-summary.md)
