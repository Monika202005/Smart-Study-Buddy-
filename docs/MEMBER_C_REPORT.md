# StudyBuddy: Project Report Chapters (Member C — Planner UI & Subjects)

**Author:** Member C (Planner UI & Subjects Lead)  
**Project:** StudyBuddy — Smart Study Planner & Adaptive AI Tutor  
**Course:** Full Stack Development (FSD)  

---

## 1. Executive Summary & Module Responsibilities

As **Member C**, I am responsible for all **user-facing planning and subject management interfaces** — the pages a student interacts with most during their daily study workflow. My work sits on top of the REST APIs designed by Member B and the AI chatbot infrastructure built by Member 1.

### Key Deliverables Owned:

| # | Deliverable | Status |
|---|---|---|
| 1 | **Landing Page** (`/landing`) — public marketing page with features, how-it-works, testimonials and CTA | ✅ Complete |
| 2 | **Login / Sign Up page** (`/login`) — mode-switch tabs, full form validation, demo login, JWT integration | ✅ Complete |
| 3 | **Planner Page** (`/planner`) — Calendar & Board views, drag-and-drop rescheduling, inline task creation, AI plan generation | ✅ Complete |
| 4 | **PlannerCalendar component** — 6-week HTML5 drag-and-drop calendar using `date-fns` | ✅ Complete |
| 5 | **TaskDetailModal component** — per-task reschedule, completion toggle, priority/subject details | ✅ Complete |
| 6 | **Subjects & Syllabus Page** (`/subjects`) — full CRUD for subjects & topics, status cycling, per-topic quiz/tutor bridges | ✅ Complete |
| 7 | **AddSubjectModal component** — name, exam date, colour picker with preview | ✅ Complete |
| 8 | **AddTopicModal component** — name, difficulty (1–3), estimated hours slider, cognitive-weight preview | ✅ Complete |
| 9 | **Extended API client** (`services/api.js`) — `createTaskApi`, `rescheduleTaskApi`, `createSubjectApi`, `deleteSubjectApi`, `createTopicApi`, `updateTopicStatusApi`, `deleteTopicApi` | ✅ Complete |

---

## 2. Architecture & Design Decisions

### 2.1 Component Hierarchy

```
App.jsx
├── /landing  →  LandingPage.jsx            (Member C — public)
├── /login    →  LoginPage.jsx              (Member C + B — Auth)
└── AppShell
    ├── /planner  →  PlannerPage.jsx        (Member C)
    │   ├── PlannerCalendar.jsx             (Member C — calendar grid)
    │   └── TaskDetailModal.jsx             (Member C — task detail/reschedule)
    └── /subjects →  SubjectsPage.jsx       (Member C)
        ├── AddSubjectModal.jsx             (Member C)
        └── AddTopicModal.jsx               (Member C)
```

### 2.2 State Management Strategy

All page-level state is kept **locally** inside each page component using `useState` and `useCallback`. The global **Zustand store** (`useStore`) is only accessed for two cross-cutting concerns:
- `openChatWithPrompt(text)` — opens the floating AI tutor with a pre-filled prompt
- `generateCustomQuiz(topic, subject)` — triggers the quiz generation flow (Member 1 integration)

This design avoids store bloat while keeping the chatbot integration seamless.

### 2.3 Drag-and-Drop Calendar (No External Library)

The `PlannerCalendar` component implements drag-and-drop using the **native HTML5 Drag and Drop API** (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) to avoid adding heavy dependencies like `react-dnd` or `@dnd-kit`.

- Task cards in each day cell are `draggable`.
- Dropping onto a different day cell calls `rescheduleTaskApi(taskId, newDate)`.
- The calendar grid is built with `date-fns` helpers: `startOfMonth`, `endOfMonth`, `startOfWeek`, `eachDayOfInterval`.
- The grid always shows **6 complete Mon→Sun weeks** to ensure visual consistency across months.

---

## 3. Page Descriptions

### 3.1 Landing Page (`/landing`)

A responsive public-facing marketing page with:

- **Sticky glass navbar** that gains background blur on scroll.
- **Hero section** with ambient gradient blobs, headline, subheading and two CTAs.
- **Stats strip** (6 modules, 4 tool-actions, 100% offline-safe, team of 4).
- **Features grid** — six cards, one per module, with hover glow effects and member attribution badges.
- **How It Works** — four numbered steps explaining the student workflow.
- **Testimonials** — three student cards with star ratings.
- **Final CTA** banner and footer.
- Uses an `IntersectionObserver`-powered `<FadeIn>` wrapper for scroll-reveal animations.

### 3.2 Smart Planner Page (`/planner`)

Dual-view planner:

| View | Description |
|---|---|
| **Calendar** | Full-month drag-and-drop grid. Click any task to open `TaskDetailModal`. |
| **Board** | 3-column Kanban board: Overdue / Today / Upcoming. Inline task toggle. |

Action bar provides:
- **Generate AI Study Plan** — POST `/api/planner/generate` → triggers Member B's scheduling algorithm.
- **Reschedule Missed** — POST `/api/planner/reschedule-missed` → auto-rebalances overdue tasks.
- **Add Task** — inline expandable form (title, subject, priority, hours, due date).
- **Ask AI Tutor** — fires a pre-filled chat prompt via the floating widget.

### 3.3 Subjects & Syllabus Page (`/subjects`)

Full CRUD subject management:

- **Add Subject** modal — name, exam date (validated ≥ today), colour picker (10 presets).
- **Delete Subject** — with confirmation prompt, cascade-deletes topics client-side.
- **Expandable subject cards** — per-subject: coverage bar, exam countdown badge, topic count, total hours.
- **Topic rows** — click the `CheckCircle` to cycle status: `pending` → `in_progress` → `completed` → `pending`.
- **Add Topic** modal — name, difficulty (Easy/Medium/Hard), hours slider, live cognitive weight preview ($W = \text{difficulty} \times \text{hours}$).
- **Quiz Me / Tutor** buttons per topic — bridge to Member 1's quiz and chatbot features.
- **Search bar** — filters subjects and topics simultaneously.

---

## 4. API Integration Summary

All APIs follow the team contract from `docs/api-contract.md`:

| API Call | Method | Endpoint | Purpose |
|---|---|---|---|
| `fetchSubjectsApi` | GET | `/api/subjects` | Load all subjects with topics |
| `createSubjectApi` | POST | `/api/subjects` | Add a new subject |
| `deleteSubjectApi` | DELETE | `/api/subjects/:id` | Remove subject |
| `createTopicApi` | POST | `/api/subjects/:id/topics` | Add topic to subject |
| `updateTopicStatusApi` | PUT | `/api/topics/:id` | Cycle topic status |
| `deleteTopicApi` | DELETE | `/api/topics/:id` | Remove topic |
| `fetchTasksApi` | GET | `/api/tasks` | Load all tasks |
| `createTaskApi` | POST | `/api/tasks` | Create manual task |
| `toggleTaskCompleteApi` | PATCH | `/api/tasks/:id/complete` | Toggle done/pending |
| `rescheduleTaskApi` | PUT | `/api/tasks/:id` | Drag-and-drop reschedule |
| `triggerGeneratePlanApi` | POST | `/api/planner/generate` | AI auto-schedule |
| `triggerRescheduleMissedApi` | POST | `/api/planner/reschedule-missed` | Rebalance overdue |

---

## 5. UI/UX Design Principles

1. **Dark glassmorphism theme** — consistent with Member 1's app shell (`slate-950` background, `slate-900` cards, `indigo-500`/`purple-600` accent gradients).
2. **Micro-interactions** — hover scale, translate-Y lifts, animated borders, fade-in on mount.
3. **Colour-coded priority** — Rose (high), Amber (medium), Emerald (low) used consistently in all task views.
4. **Exam urgency signals** — `ExamCountdown` badges turn rose/amber as exams approach, with a pulse animation on exam-day.
5. **Empty states** — every list has a meaningful empty state with a contextual CTA.
6. **Responsive** — all pages work on mobile (single-column) and desktop (multi-column grid).
7. **Accessibility** — `title` attributes on draggable items, `aria` feedback via visible text banners, keyboard-navigable modals.

---

## 6. Integration with Other Members

| Member | Integration Point |
|---|---|
| **Member 1 (Lead)** | `openChatWithPrompt()` from Zustand store — fires the AI tutor with pre-filled context from Planner/Subjects pages. `generateCustomQuiz()` — triggered from topic rows in SubjectsPage. |
| **Member B** | All REST endpoints consumed (auth, subjects, topics, tasks, planner). The landing page's `/login` CTA uses Member B's JWT auth flow. |
| **Member D** | Landing page features section lists Pomodoro & Analytics as module cards. Sidebar badge updated to show Member D modules. |

---

## 7. New Files Created by Member C

```
client/src/pages/
  LandingPage.jsx              # Public marketing landing page
  PlannerPage.jsx              # Full planner (replaces stub)
  SubjectsPage.jsx             # Full subjects & syllabus (replaces stub)

client/src/components/planner/
  PlannerCalendar.jsx          # HTML5 drag-and-drop calendar grid
  TaskDetailModal.jsx          # Task detail / reschedule modal

client/src/components/subjects/
  AddSubjectModal.jsx          # Add subject form with colour picker
  AddTopicModal.jsx            # Add topic form with difficulty & hours

docs/
  MEMBER_C_REPORT.md           # This report
```

**Modified files:**
- `client/src/App.jsx` — added `/landing` route
- `client/src/services/api.js` — added 9 new API functions
- `client/src/components/layout/Sidebar.jsx` — updated Member C badges to ✅, added Landing Page nav link

---

## 8. Verification Checklist

| Feature | How to Verify |
|---|---|
| Landing page loads | Visit `http://localhost:5173/landing` |
| Scroll animations | Scroll down — feature cards and how-steps fade in |
| Login / Sign up | Visit `/login`, switch tabs, fill form |
| Calendar view | Visit `/planner` → click Calendar tab |
| Drag task to new day | Drag any task card to a different day in the calendar |
| Board view | `/planner` → click Board tab → see Overdue/Today/Upcoming columns |
| Add Task inline | Click "Add Task" button, fill form, submit |
| Task Detail Modal | Click any task → modal shows with reschedule date-picker |
| Generate AI Plan | Click "Generate AI Study Plan" → feedback banner appears |
| Reschedule Missed | Click "Reschedule Missed" → overdue tasks roll forward |
| Subject list loads | Visit `/subjects` — cards with progress bars |
| Add Subject | Click "Add Subject" → modal with colour picker |
| Add Topic | Expand a subject → click "Add Topic" → difficulty + hours form |
| Status cycling | Click ✓ icon on topic → cycles pending → in_progress → completed |
| Delete subject/topic | Hover → trash icon appears → confirm dialog |
| Search filter | Type in search box — subjects/topics filter live |
| Quiz Me bridge | Click "Quiz Me" on a topic → navigates to `/flashcards` with generated quiz |
| AI Tutor bridge | Click "Tutor" on a topic → floating chat opens with explanation prompt |

