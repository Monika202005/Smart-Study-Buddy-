# StudyBuddy: Project Report Chapters (Member A — Team Lead)

**Author:** Monika Sharma (Member A — Team Lead + AI Chatbot & Quiz)  
**Project:** StudyBuddy — Smart Study Planner & Adaptive AI Tutor  
**Course:** Full Stack Development (FSD)  

---

## 1. Introduction
Modern university education challenges students with multifaceted cognitive demands: managing multiple technical courses concurrently, adhering to stringent assignment deadlines, and pacing revision schedules prior to cumulative semester examinations. Existing organizational tools operate in isolation—calendars manage dates, task managers store static checklists, and general conversational AI tools lack real-time context of an individual student's syllabus, milestones, or current workload.

**StudyBuddy** is an intelligent, full-stack academic planning and adaptive tutoring web application engineered to bridge this gap. By uniting an algorithmic study scheduler with a planner-aware AI study companion, active-recall flashcards, and weak-topic detection, StudyBuddy empowers students to optimize their study hours and achieve peak retention with zero scheduling overhead.

---

## 2. Problem Statement
1. **Cognitive Overload & Fragmented Planning:** Students scatter study materials across Notion, Google Calendar, physical notebooks, and task apps. Without unified progress tracking, they struggle to determine which topics require urgent attention each day.
2. **Static Schedules vs. Dynamic Reality:** Traditional timetable tools are brittle. When a student falls behind by a single day, the timetable collapses, causing stress and procrastination rather than adaptive rebalancing.
3. **Context-Blind Tutoring:** General LLM chatbots (e.g., standard ChatGPT) have no awareness of a student's upcoming exam dates, past quiz performance, or daily workload limits. Students are forced to re-explain their situation in every prompt.
4. **Passive Reading vs. Active Recall:** Students often rely on passive re-reading of textbooks. Without immediate quiz checks and automated weak-topic identification, knowledge gaps remain invisible until examination day.

---

## 3. Comparison with Existing Applications

| Feature / Capability | Google Calendar | Notion / Todoist | Generic LLM Chatbots | **StudyBuddy (Our Solution)** |
|---|:---:|:---:|:---:|:---:|
| **Auto-Planning Around Exam Dates** | ❌ No | ❌ No | ❌ No | ✅ **Yes (Difficulty x Hours weighting)** |
| **Schedule-Aware AI Chatbot** | ❌ No | ❌ No | ❌ Blind to user schedule | ✅ **Yes (Injected Planner Context)** |
| **Tool Calling for Plan Actions** | ❌ No | ❌ No | ❌ No | ✅ **Yes (`get_today_plan`, `create_task`, etc.)** |
| **Active Recall Flashcards** | ❌ No | ⚠️ Manual tables only | ⚠️ Text only | ✅ **Yes (3D Flip Deck & Quiz Engine)** |
| **Automated Weak-Topic Flagging** | ❌ No | ❌ No | ❌ No | ✅ **Yes (Algorithmic analysis of errors)** |
| **Global Floating Assistant** | ❌ No | ❌ No | ⚠️ Separate window | ✅ **Yes (Accessible across all views)** |

---

## 4. System Architecture & Project Scope

StudyBuddy utilizes a decoupled client-server architecture with clear team ownership boundaries:

```
[ React 19 Frontend (Vite) ] <--- REST/JSON ---> [ Node.js Express Backend ] <--- Repository Layer ---> [ Data Store ]
   • App Shell & Responsive Layout                  • JWT Auth Middleware (req.user)                   • In-Memory Store (Active)
   • Zustand Centralized State                      • Rate Limiting (express-rate-limit)               • MongoDB Mongoose (Member B)
   • 3D Flashcard Deck & Quiz Mode                  • Dynamic Context Builder
   • Global Floating Chatbot Widget                 • Tool Calling & Schema Validator
   • Teammate Integration Stubs                     • LLM Service (Timeout + Retry)
```

### Module Implementation Reality:
- **Member A Slice (Lead - Real & Verified):**
  - Full-page AI Tutor and global floating assistant widget (`/chat`).
  - Dynamic Context Builder querying live student state.
  - 4 Tool Calling actions with server-side schema and date validation (`get_today_plan`, `create_task`, `reschedule_missed`, `generate_flashcards`).
  - LLM timeout protection (15s default via `AbortController`) and single-retry policy with friendly fallback tutor response (never a 500 error).
  - Defense-in-depth prompt isolation (`<<<STUDENT_INPUT>>>`, `<<<PLANNER_CONTEXT>>>`) and normalized input sanitization.
  - Interactive 3D flip card active recall deck and quiz mode with automated weak-topic detection.
  - Decoupled data access layer (`plannerRepository.js`).
  - Automated test suite (31 Jest/Supertest tests) and live chatbot test runner (21 verified test cases).
- **Teammates' Modules (Stubbed for decoupled development):**
  - Member B: Production MongoDB Atlas models, bcrypt password hashing, JWT cryptographic verification, and greedy scheduling algorithm.
  - Member C: Planner calendar drag-and-drop UI and Subjects view.
  - Member D: Pomodoro focus timer logging and Recharts analytics dashboard.

---

## 5. Chatbot Design & Tool Calling Engine (Member A Core Deliverable)

### 5.1 System Prompt & Security Boundary Design
The study tutor prompt adheres to pedagogical excellence and security best practices:
- **Pedagogical Persona:** Encouraging, empathetic, and academically rigorous study coach.
- **Analogy Principle:** Explains technical abstractions using tangible real-world analogies (e.g., LIFO stacks as cafeteria plates, AVL balancing as pivot scales).
- **Mandatory Assessment:** Concludes concept explanations with one conceptual check question to stimulate active recall.
- **Data vs. Instruction Delimitation:** All student messages, planner context, and tool results are explicitly wrapped in delimiter tags (`<<<STUDENT_INPUT>>>`, etc.). The system prompt instructs the model to treat all delimited content strictly as data, neutralizing prompt-injection exploits.
- **Input Normalization:** Pre-processes queries by removing zero-width characters (`\u200B-\u200D\uFEFF`), lowercasing, and collapsing whitespace before keyword blocklist checks.

### 5.2 Dynamic Context Builder
Prior to dispatching requests to the LLM or local engine, the backend queries the `plannerRepository` for:
1. Student daily available hours and streak.
2. Upcoming exams within 14 days (with remaining days countdown).
3. Today's scheduled tasks (completed vs pending).
4. Overdue/missed tasks from past days.
5. Weak topics identified by the student's quiz history.
6. The last 5 conversational exchanges.

### 5.3 Tool Calling & Server-Side Schema Validation
Tools execute **only when the model emits a structured tool call**, never through raw text regex matching. Every call is validated server-side by `toolValidator.js`:
1. `get_today_plan`: Fetches today's study load, priority levels, and nearest exams.
2. `create_task`: Validates title (1–150 chars), durationHours (0.5–8.0), priority enum, and ISO date format (YYYY-MM-DD, bounded between 2020 and 2035).
3. `reschedule_missed`: Automatically rolls overdue tasks forward into today's schedule for the authenticated user.
4. `generate_flashcards`: Generates high-yield cards (capped at 10) with JSON output schema validation and saves them to the student's deck.

### 5.4 LLM Fault Tolerance & Retry Architecture
- **Timeout Protection:** Every external Gemini call is governed by an `AbortController` timer (default 15,000ms, configurable via `LLM_TIMEOUT_MS`).
- **Single-Retry Policy:** Automatically retries exactly once for timeouts, network drops, HTTP 429, and HTTP 5xx errors. Rejects retrying 4xx client errors.
- **Zero-500 Fallback:** If both attempts fail, the service returns a high-quality study tutor response based on planner context, ensuring zero service disruption.
- **Loop Cap:** Tool iterations are strictly bounded to a maximum of 3 cycles per message.

---

## 6. Flashcard Deck, Quiz Mode & Weak-Topic Detection (⭐ Member A Feature)
- **3D Flip Card Component:** Leverages CSS `preserve-3d` and `rotateY(180deg)` transformations for tactile, realistic study card interactions.
- **Interactive Quiz Engine:** Offers multiple-choice assessments with instant option color coding, explanation displays, and confetti celebration effects on completion.
- **Algorithmic Weak-Topic Detection:** Automatically filters quiz questions with `lastResult === 'incorrect'`, aggregates them by subject/topic, and provides a 1-click bridge for the student to ask the AI Tutor for remedial clarification.

---

## 7. Verification & Automated Test Evidence
Member A's slice is verified through a dual test strategy:
1. **Automated Jest + Supertest Suite (`npm test`)**:
   - 31 automated tests across 3 test suites (`tests/chat.test.js`, `tests/tools.test.js`, `tests/quiz.test.js`).
   - Verifies input validation, rate limiting (HTTP 429), prompt injection blocking, tool schema constraints, user ID isolation, LLM timeout/retry fallback, and history pagination.
   - Result: **31 / 31 Passed (100%)**.
2. **Live Chatbot Test Runner (`server/scripts/run-chat-tests.js`)**:
   - 21 end-to-end test cases covering schedule awareness, tool calling, fault tolerance (simulated 500, simulated timeout), and tool-forcing injection defense.
   - Result: **21 / 21 Passed (100%)**, documented with timestamps in [`docs/chatbot-test-results.md`](file:///Users/monika/fsd%20project/docs/chatbot-test-results.md).

---

## 8. Known Limitations
1. **Database Default**: Operates on an in-memory repository until Member B supplies the MongoDB connection string.
2. **Authentication Mocking**: `authMiddleware` injects an authenticated mock user context for development; cryptographic JWT validation and bcrypt password hashing await Member B.
3. **LLM Key**: In the absence of `GEMINI_API_KEY`, the local smart tutor provides contextual academic answers and simulated tool execution.

---

## 9. Integration Notes for Teammates
- **Member B**: Update `server/services/plannerRepository.js` to connect your Mongoose models to the chatbot context and tools. No other chatbot files need to be touched.
- **Member C**: Connect your calendar and syllabus components to the endpoints defined in [`docs/api-contract.md`](file:///Users/monika/fsd%20project/docs/api-contract.md).
- **Member D**: Connect your timer logging and Recharts visualizations to `/api/analytics/summary`.

---

## 10. Conclusion
As Member A and Team Lead, I have established the architectural foundation and fully implemented the AI Chatbot, Tool Calling Engine, Flashcards & Quiz system, Weak-Topic Detection, and App Shell. The module is resilient, secure, fully tested, and cleanly decoupled for seamless teammate integration.
