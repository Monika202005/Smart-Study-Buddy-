# StudyBuddy — Team Roles & Deliverables Matrix

## Team Roster (4 Members)

| Member | Role | Module Ownership | Deliverables & Status |
|---|---|---|---|
| **Member A (Monika - Lead)** | **Team Lead + AI Chatbot & Quiz** | App Shell & Routing, AI Chatbot UI & API, Dynamic Context Builder, 4 Tool Actions with Schema Validation, Flashcards & Quiz Engine with LLM generation, Weak-Topic Detection, Automated Test Suite (31 unit/integration + 21 chat runner tests), CI/CD, Shared API Contract. | **✅ REAL, HARDENED & TESTED** |
| **Member B** | **Backend Core + Scheduler** | Express Server setup, MongoDB Atlas models (User, Subject, Topic, Task, Session), Auth (JWT + bcrypt), Subjects & Topics CRUD, Tasks CRUD, Auto-schedule greedy algorithm, Reminders (node-cron + Nodemailer). | *Contract agreed; stubs ready (mock store active)* |
| **Member C** | **Planner UI + Subjects** | Landing page, Login/Signup forms, Planner calendar with drag-and-drop, Subjects & Syllabus view, Plan preview and reschedule modal UI. | *App shell & routing mounted (stubs active)* |
| **Member D** | **Dashboard + Analytics** | Dashboard layout, Pomodoro focus timer, Analytics charts (Recharts), Streak calculation, Dark mode styling, Accessibility pass. | *App shell & routing mounted (stubs active)* |

---

## Weekly Standup Cadence
- **Monday 10:00 AM**: Sprint Kickoff & Blocker Review
- **Thursday 4:00 PM**: Mid-week Integration Sync
- **Saturday 5:00 PM**: Weekly Integration Build & Demo Run

---

## Integration Architecture & Hand-Off Points

1. **Planner Repository Decoupling (`server/services/plannerRepository.js`)**:
   - Member A engineered a dedicated data access layer so Member B can swap in MongoDB Mongoose queries in a single file without modifying AI chatbot or tool calling code.
2. **Authentication Middleware (`server/middleware/authMiddleware.js`)**:
   - Member B will attach cryptographic JWT verification. Member A's chat and quiz endpoints already extract `userId` strictly from `req.user.userId`.
3. **App Shell Ready for Teammates**:
   - Member C and Member D can swap out `TeammateModuleStub` on `/planner`, `/subjects`, `/timer`, and `/analytics` with their production React components.
