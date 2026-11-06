# StudyBuddy — Evaluation Screenshot Capture Checklist

Use this checklist to capture high-resolution screenshots for the **Project Report**, **Presentation Slides**, and repository **README.md**.

---

## Screenshot Matrix

| # | Feature / View | URL Path | Viewport | Trigger / State Instructions | Required Elements Visible in Capture |
|:---:|---|---|:---:|---|---|
| **01** | **Dashboard & Exam Countdown** | `http://localhost:5173/` | Desktop (1440x900) | Default loaded state with mock data. | • Hero welcome card with student name<br/>• Target exam countdown badge ("CS301 in 5 Days")<br/>• Today's Study Plan list with priority pills<br/>• Upcoming Exams list |
| **02** | **Chatbot Tool Execution (`get_today_plan`)** | `http://localhost:5173/chat` | Desktop (1440x900) | Type: `What should I study today?` | • Injected context bar at top<br/>• AI Mode indicator ("Offline tutor" or "Gemini")<br/>• Assistant response listing pending tasks and exam countdown<br/>• Executed tool action badge |
| **03** | **Plan Rebalancing Tool (`reschedule_missed`)** | `http://localhost:5173/chat` | Desktop (1440x900) | Type: `I missed yesterday, fix my plan.` | • Assistant confirmation of rolled-forward tasks<br/>• Rebalanced task names<br/>• Suggested Pomodoro focus block |
| **04** | **3D Flashcard Flip (Active Recall)** | `http://localhost:5173/flashcards` | Desktop (1440x900) | Click on any card in the deck to flip to the answer side. | • 3D rotated card showing "Correct Answer"<br/>• "Ask Tutor →" quick link on the card<br/>• Subject tag ("Data Structures") and topic tag<br/>• Self-grading buttons ("Got it" / "Missed it") |
| **05** | **Interactive Quiz Mode with Feedback** | `http://localhost:5173/flashcards` | Desktop (1440x900) | Select "Interactive Quiz Mode" tab. Click the correct option. | • Question progress ("Question 1 of 3")<br/>• Score counter pill ("Score: 1")<br/>• Green emerald border on correct option with check icon<br/>• "Next Question" or "View Results" action button |
| **06** | **Automated Weak-Topic Banner** | `http://localhost:5173/flashcards` | Desktop (1440x900) | Answer a quiz question incorrectly to trigger the weak-topic record. | • Purple/amber alert banner at top of page<br/>• Weak topic name displayed (e.g., "Binary Search Trees")<br/>• "Ask Tutor to Explain Topic" 1-click button |
| **07** | **Global Floating Assistant Widget** | `http://localhost:5173/planner` (or `/`) | Desktop (1440x900) | Click floating trigger button at bottom-right of screen. | • Floating drawer open at bottom right<br/>• Close (X) and Expand buttons in header<br/>• Embedded chat conversation visible while viewing page |
| **08** | **Chat Fault Tolerance & Retry State** | `http://localhost:5173/chat` | Desktop (1440x900) | Trigger an offline failure or simulate error state. | • Rose alert banner: "AI tutor temporarily unavailable."<br/>• Retry button with refresh icon<br/>• Friendly fallback tutor message |
| **09** | **Mobile Responsive View** | `http://localhost:5173/` | Mobile (390x844 - iPhone 14) | Use browser DevTools mobile emulation mode. | • Responsive single-column layout<br/>• Mobile hamburger menu button<br/>• Compact dashboard cards and bottom floating button |
| **10** | **Teammate Integration Contract Stub** | `http://localhost:5173/analytics` | Desktop (1440x900) | Navigate to Analytics tab. | • "Study Analytics & Consistency" stub banner<br/>• "Module Owner: Member D" indicator<br/>• Planned REST endpoints list (`GET /api/analytics/summary`)<br/>• KPI preview cards |

---

## File Naming Convention for Report
Save exported screenshots to `docs/screenshots/`:
- `01_dashboard_desktop.png`
- `02_chat_schedule_awareness.png`
- `03_chat_tool_reschedule.png`
- `04_flashcard_3d_flip.png`
- `05_quiz_interactive_feedback.png`
- `06_weak_topics_detection.png`
- `07_floating_chat_widget.png`
- `08_chat_error_retry.png`
- `09_mobile_responsive_view.png`
- `10_teammate_stub_contract.png`

