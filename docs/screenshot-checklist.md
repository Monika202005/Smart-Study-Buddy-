# StudyBuddy — Evaluation Screenshot Capture Checklist

Use this checklist to capture high-resolution screenshots for the **Project Report**, **Presentation Slides**, and repository **README.md**.

---

## Screenshot Matrix

| # | Feature / View | URL Path | Viewport | Trigger / State Instructions | Required Elements Visible in Capture |
|:---:|---|---|---|:---:|---|
| **01** | **Public Landing Page** | `http://localhost:5173/` | Desktop (1440x900) | Unauthenticated homepage | • StudyBuddy logo, Hero headline, CTA buttons ("Get Started", "Sign In")<br/>• Feature pillars (AI Tutor, Pure Auto-Scheduler, Active Recall)<br/>• Interactive feature preview |
| **02** | **Student Authentication** | `http://localhost:5173/login` | Desktop (1440x900) | Sign in view | • Tab switch between Login and Sign Up<br/>• Email and Password fields with validation state<br/>• "Sign In" button with loader spinner |
| **03** | **Private Dashboard** | `http://localhost:5173/app/dashboard` | Desktop (1440x900) | Authenticated student workspace | • User profile badge & dynamic streak counter<br/>• Nearest Target Exam countdown badge ("Data Structures in 6 Days")<br/>• Today's Study Plan list with priority badges<br/>• Upcoming Exams list |
| **04** | **Context-Aware AI Tutor** | `http://localhost:5173/app/chat` | Desktop (1440x900) | Type: `What should I study today?` | • Live AI Model pill ("gemini-3.5-flash-lite")<br/>• Executed tool badge (`get_today_plan`)<br/>• Generative study plan response synthesized around student's real exams |
| **05** | **Plan Rebalancing Tool** | `http://localhost:5173/app/chat` | Desktop (1440x900) | Type: `I missed yesterday, fix my plan.` | • Assistant confirmation of rolled-forward overdue tasks<br/>• Executed tool badge (`reschedule_missed`)<br/>• Updated study priorities |
| **06** | **3D Active Recall Flashcards** | `http://localhost:5173/app/flashcards` | Desktop (1440x900) | Click on any card in the deck | • 3D rotated perspective card showing answer<br/>• Subject filter dropdown<br/>• Self-grading buttons ("Got it" / "Missed it") |
| **07** | **Interactive Quiz & Weak Topics** | `http://localhost:5173/app/flashcards` | Desktop (1440x900) | Select "Interactive Quiz Mode" tab | • Question progress and score counter<br/>• Option highlighting with emerald/rose feedback<br/>• Weak topic alert banner with "Ask Tutor" bridge |
| **08** | **Smart Planner & Calendar** | `http://localhost:5173/app/planner` | Desktop (1440x900) | View schedule calendar | • Monthly calendar with scheduled task chips<br/>• "Auto-Schedule Plan" button with preview/commit modal<br/>• Daily hour capacity indicators |
| **09** | **Pomodoro Focus Timer** | `http://localhost:5173/app/timer` | Desktop (1440x900) | Select a task and run timer | • Circular focus countdown timer<br/>• Selectable task dropdown<br/>• Quick 6s test button & session completed notification |
| **10** | **Recharts Live Visual Analytics** | `http://localhost:5173/app/analytics` | Desktop (1440x900) | View analytics dashboard | • 7-day study hours Recharts bar chart<br/>• Subject distribution Recharts pie chart<br/>• Syllabus progress bars and streak metrics |

---

## File Naming Convention for Report
Save exported screenshots to `docs/screenshots/`:
- `01_public_landing_page.png`
- `02_login_signup_auth.png`
- `03_private_dashboard.png`
- `04_chat_schedule_awareness.png`
- `05_chat_tool_reschedule.png`
- `06_flashcard_3d_flip.png`
- `07_quiz_weak_topics.png`
- `08_smart_planner_calendar.png`
- `09_pomodoro_timer_logging.png`
- `10_recharts_analytics.png`
