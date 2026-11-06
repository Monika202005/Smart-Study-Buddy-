# StudyBuddy — Final Presentation Slides Outline (Member A / Team Lead)

**Target Duration:** 10–12 Minutes  
**Presenter:** Member A (Monika Sharma — Team Lead + AI Chatbot & Quiz)

---

### Slide 1: Title & Project Overview
- **Header:** StudyBuddy: Smart Study Planner & Adaptive AI Academic Tutor
- **Sub-header:** Full Stack Development Project — Team of 4
- **Lead Role:** Monika Sharma (Team Lead, AI Chatbot, Tool Calling Engine, Flashcard & Quiz System, App Shell & CI)
- **Core Vision:** Uniting algorithmic study schedule management with a planner-aware, secure generative AI tutor for university students.

---

### Slide 2: The Academic Problem
- **Cognitive Fragmentation:** Students juggle separate apps for calendars, checklists, lecture notes, and revision timetables.
- **Brittle Static Timetables:** Missing a single study session breaks standard calendar schedules, causing demotivation.
- **Context-Blind LLM Chatbots:** Generic AI assistants (e.g., standard ChatGPT) have no awareness of a student's upcoming exam dates, today's tasks, or past quiz weak points.
- **Passive Studying Trap:** Passive re-reading yields poor retention compared to immediate active-recall testing.

---

### Slide 3: Comparison with Existing Solutions
- **Feature Comparison Matrix:**
  - *Google Calendar / Notion:* Static schedules, zero schedule-aware AI, zero active-recall quiz feedback.
  - *Generic Chatbots:* Strong reasoning, but completely blind to student syllabus, deadlines, and task state.
  - *StudyBuddy Advantage:* Combines exam countdowns, planner context ingestion, automatic missed-task rebalancing, 3D active-recall flashcards, and weak-topic detection into a unified dark-mode workspace.

---

### Slide 4: System Architecture & Decoupled Team Slices
- **Frontend Layer:** React 19 + Vite, Tailwind CSS v4, Zustand centralized state, responsive sidebar and floating assistant.
- **Backend Layer:** Node.js Express ESM REST API, Helmet security headers, rate limiting (30 req/min), CORS.
- **Lead Modules (100% Real & Verified):** AI Chatbot, 4 Tool Calling actions, Schema Validator, Flashcard & Quiz engine, App Shell & Routing.
- **Decoupling Strategy (`plannerRepository.js`):** A single data-access boundary decoupling Member 1's chatbot from Member B's database models, allowing parallel teammate development without merge conflicts.

---

### Slide 5: Chatbot Pedagogical Design & Security Guardrails
- **Pedagogical Persona:** Motivating academic coach that breaks down complex CS concepts using tangible real-world analogies (e.g., AVL tree balance as pivot scales; B+ trees as encyclopedia leaf indexes).
- **Mandatory Active Recall Check:** Every concept explanation ends with ONE conceptual check question.
- **Prompt Injection Defense:** Strict data delimiter blocks (`<<<PLANNER_CONTEXT>>>`, `<<<STUDENT_INPUT>>>`, `<<<TOOL_RESULT>>>`) treated exclusively as DATA.
- **Input Normalization:** Strips zero-width characters and collapses multi-whitespace before running defense-in-depth keyword filtering.

---

### Slide 6: Dynamic Context Builder & Local Midnight Math
- **Live Planner Ingestion:** Pre-fetches student daily study limit, today's pending/done tasks, overdue assignments, nearest exams, and weak topics before every query.
- **Calendar-Day Countdown Precision:** Computes exam countdowns using local calendar midnight differences (`calculateCalendarDaysLeft`), eliminating 24h floor/ceil and UTC offset drift bugs.
- **Zero Hallucination Guarantee:** The model is strictly instructed to reference only injected planner state for dates, tasks, and deadlines.

---

### Slide 7: Secure Tool Calling & Server-Side Schema Validation
- **Model-Triggered Exclusivity:** Tools execute **only** when the generative model emits a structured `functionCall`, never through regex matching of user text.
- **Server-Side Validator (`toolValidator.js`):** Validates types, character bounds, priority enums, and calendar-valid ISO dates (2020–2035).
- **Four Production Tools:**
  1. `get_today_plan`: Fetches today's study load and nearest milestones.
  2. `create_task`: Validates and saves new study tasks.
  3. `reschedule_missed`: Automatically rolls overdue tasks forward.
  4. `generate_flashcards`: Generates active-recall flashcards capped at 10.
- **Zero Cross-Tenant Escalation:** `userId` is strictly bound to `req.user.userId` from session tokens, never model arguments.

---

### Slide 8: LLM Fault Tolerance & Zero-500 Fallback Architecture
- **AbortController Timeout:** Bounded by a 15-second deadline (configurable via `LLM_TIMEOUT_MS`).
- **Single-Retry Policy:** Exactly one automatic retry on retryable transient conditions (network drops, timeouts, HTTP 429, upstream 5xx). No retry on 4xx client errors.
- **Zero-500 Guarantee:** If upstream LLM remains unreachable, returns a friendly fallback tutor response (`getFriendlyFallbackResponse`) with status 200. The API never crashes with a 500.
- **Tool Loop Protection:** Iterations capped at 3 cycles per message to prevent runaway billing or infinite loops.

---

### Slide 9: Active-Recall Flashcard Deck & Weak-Topic Detection
- **Tactile 3D Flip Cards:** Built with CSS `preserve-3d` and `rotateY(180deg)` transformations for active recall practice.
- **Interactive Quiz Engine:** Immediate option color-coding, explanation reveals, and confetti animations on completion.
- **Automated Weak-Topic Remediation:** Tracks incorrect quiz questions, dynamically updates the **Weak Topics Banner**, and provides a 1-click bridge to open the AI Tutor with pre-filled conceptual questions.

---

### Slide 10: Verification, Automated Testing & CI Pipelines
- **Tri-Part Verified Test Strategy:**
  1. *Client Smoke Tests (Vitest + React Testing Library):* 4 passing tests verifying message dispatch, error retry, card flip, and quiz feedback.
  2. *Server Jest Suite (Jest + Supertest):* 31 automated tests across 3 suites verifying validation, rate limits, injection blocking, tool schemas, and timeout retry.
  3. *Chatbot Programmatic Runner (21 End-to-End Cases):* Real assertions verifying schedule awareness, tools, and fallback behavior.
- **GitHub Actions CI (`ci.yml`):** Automatically executes linting, Vite build, client tests, server tests, and chatbot test runner on every commit.

---

### Slide 11: Live Demonstration Highlights
- **Demo Walkthrough (5-Minute Script):**
  1. *Dashboard & Countdown:* Target exam countdown badge and priority task board.
  2. *Schedule-Aware Chat:* "What should I study today?" -> automatic context injection and `get_today_plan` tool execution.
  3. *Auto-Rebalancing:* "I missed yesterday, fix my plan." -> rolls forward tasks, auto-refreshes planner without page reload.
  4. *Active Recall Deck:* 3D flashcard flip, quiz score calculation, and weak-topic detection banner.
  5. *Security Demonstration:* Injection prompt override blocked safely with friendly boundary notice.

---

### Slide 12: Architectural Limitations & Future Scope
- **Current Limitations (Honest Scoping):**
  - Database currently uses `mockPlannerStore.js` pending Member B's MongoDB connection.
  - JWT auth uses mock user injection pending Member B's bcrypt/JWT middleware.
  - Teammate pages feature interactive stubs preserving the unified application shell.
- **Future Scope:**
  - Multi-modal syllabus ingestion (RAG chunking of lecture PDF slides).
  - Voice-enabled tutoring sessions via Gemini Live API.
  - Full SuperMemo (SM-2) spaced repetition interval scheduling.

