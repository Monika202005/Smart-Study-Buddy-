# 🎓 StudyBuddy — Smart Study Planner & AI Tutor

> Full Stack Web Development Project | Team of 4 | 6-Week Plan  
> **Lead by Member 1 (Monika Sharma)**: AI Chatbot, Tool Actions, Flashcards & Quiz, App Shell & Integration.

---

## 🌟 Overview
**StudyBuddy** is a full-stack academic study assistant engineered for university students. Unlike static calendar apps or general AI chatbots, StudyBuddy combines:
1. **Algorithmic Study Planning** around exam dates and syllabus weights.
2. **Context-Aware AI Study Tutor** that knows your exam dates, today's tasks, and weaknesses.
3. **Tool Calling Actions**: The AI can fetch your daily plan, create study tasks, reschedule overdue work, and generate flashcards.
4. **Interactive Flashcards & Quiz Mode**: 3D flip card active recall, multiple-choice quizzes, and automated weak-topic detection.
5. **App Shell & Floating Assistant**: A global floating chat widget accessible from any view in the app.

---

## 👥 Team Roles & Responsibilities

| Member | Role | Modules Owned | Status |
|---|---|---|---|
| **Member 1 (Monika - Lead)** | **Team Lead + AI Chatbot** | App Shell & Routing, AI Chatbot UI & API, Planner Context Builder, 4 Tool Actions, Flashcards & Quiz Engine, Weak-Topic Detection, Repo setup & CI, Shared API Contract. | **✅ COMPLETE & TESTED** |
| **Member 2 (Member B)** | Backend + Scheduler | Auth APIs (JWT + bcrypt), Mongoose models (User, Subject, Topic, Task, Session), Auto-schedule algorithm, Reminders (node-cron + Nodemailer). | *Contract & Stubs Ready* |
| **Member 3 (Member C)** | Planner UI + Subjects | Landing, Login, Signup, Calendar with drag-and-drop, Subjects & Syllabus view, plan preview and reschedule modal. | *App Shell Ready* |
| **Member 4 (Member D)** | Dashboard + Analytics | Dashboard layout, Pomodoro focus timer, Analytics charts (Recharts), streaks, dark mode pass. | *App Shell Ready* |

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router 7, Lucide Icons, Canvas-Confetti, Zustand.
- **Backend**: Node.js, Express, Mongoose / MongoDB (with hybrid in-memory fallback), Express-Rate-Limit, Dotenv, Cors.
- **AI Integration**: Google Gemini API integration with intelligent fallback StudyBuddy Tutor engine and dynamic context injection.

---

## 📂 Project Structure

```
studybuddy/
├── client/
│   ├── public/
│   │   └── study_hero.jpg         # 3D Generated Study Workspace Hero Asset
│   └── src/
│       ├── components/
│       │   ├── chat/              # ChatInterface, ChatMessageItem, FloatingChatWidget, PromptSuggestions
│       │   ├── flashcards/        # FlashcardDeck (3D flip), QuizMode, WeakTopicsBanner, GenerateQuizModal
│       │   └── layout/            # AppShell, Navbar, Sidebar, TeammateModuleStub
│       ├── pages/                 # DashboardPage, ChatPage, FlashcardsPage, PlannerPage, SubjectsPage, TimerPage, AnalyticsPage, SettingsPage
│       ├── services/api.js        # Frontend API client
│       └── store/useStore.js      # Zustand centralized store
├── server/
│   ├── config/db.js               # MongoDB connection with zero-downtime memory fallback
│   ├── controllers/               # chatController, quizController
│   ├── middleware/                # rateLimiter, authMiddleware
│   ├── models/                    # ChatMessage, FlashcardQuiz, mockPlannerStore
│   ├── routes/                    # chatRoutes, quizRoutes
│   ├── scripts/test-llm.js        # LLM connectivity verification script
│   ├── services/                  # chatbotService, chatbotContext, chatbotTools
│   └── server.js                  # Main server entry point (Port 5001)
├── docs/
│   ├── api-contract.md            # Formal API contract for teammates
│   ├── chatbot-test-suite.md      # 18-point chatbot test matrix (Pass/Fail)
│   ├── MEMBER_1_REPORT.md         # Final report chapters owned by Member 1
│   └── team-roles.md              # Team roles and meeting schedule
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies
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

### 3. Test LLM API Connectivity
```bash
cd server && npm run test:llm
```

---

## 🧪 Member 1 Feature Highlights & Verification

1. **AI Study Tutor (`/chat`)**:
   - Injects dynamic planner context (CS301 exam in 5 days, 2 tasks today, 1 overdue).
   - Explains academic concepts with intuitive analogies and ends with a check quiz question.
   - Built-in prompt suggestion chips for 1-click doubts.
2. **Tool Calling**:
   - `get_today_plan`: Try asking *"What should I study today?"*
   - `reschedule_missed`: Try asking *"I missed yesterday, fix my plan."*
   - `create_task`: Try asking *"Add task: Review Dynamic Programming for 2 hours"*
   - `generate_flashcards`: Try asking *"Generate flashcards on B+ Trees"*
3. **Flashcards & Quiz Mode (`/flashcards`)**:
   - Interactive 3D flip card with realistic perspective flip animation.
   - Self-grading: "Knew It (Mastered)" vs "Need Review".
   - Multiple-choice quiz mode with instant answer feedback and confetti celebration.
   - **Weak-Topic Detection**: Automatically detects topics where questions were missed and provides a 1-click *"Ask Tutor"* remediation bridge!
4. **Global Floating Assistant**:
   - Available in the bottom-right corner of every page across the entire web application.
