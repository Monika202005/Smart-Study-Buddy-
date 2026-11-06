# Pull Request Description: Lead Slice Hardening & Finish (`feature/lead-finish`)

**Target Branch:** `dev`  
**Source Branch:** `feature/lead-finish` (branched from `feature/lead-hardening`)  
**Author / Module Owner:** Member A (Team Lead — AI Chatbot, Tool Calling, Flashcard & Quiz Engine, App Shell & Integration)

---

## 1. Overview of Changes

This pull request completes and hardens the **Team Lead / Member A slice** of the StudyBuddy project. It establishes the architectural foundation for AI tutor dialogue, secure tool calling, active-recall flashcard study, and app shell routing, while cleanly decoupling teammate modules through an abstraction layer.

### Key Capabilities Delivered:
1. **LLM Fault Tolerance & Retry Policy (`server/services/chatbotService.js`):**
   - Wrapped all Gemini API requests with an `AbortController` timeout (default 15,000ms, configurable via `LLM_TIMEOUT_MS`).
   - Implemented an exact single-retry policy for retryable conditions: network timeouts, connection drops, HTTP 429 (rate limit), and upstream 5xx errors.
   - 4xx validation errors fail immediately without retry.
   - If retries fail or the API key is absent, returns a friendly fallback tutor response (status 200, avoiding 500 crashes).
   - Tool execution loop is capped at a maximum of 3 iterations per conversation turn.

2. **Security & Injection Hardening (`server/services/toolValidator.js`, `chatbotService.js`):**
   - Tools run **strictly** when the model emits a `functionCall` part. Never triggered by regex or raw user text in the LLM path.
   - Prompt injection defense-in-depth: input normalization (collapses multi-whitespace, lowercases, strips zero-width characters) prior to blocklist matching.
   - Strict data boundaries: planner context, user text, and tool results are wrapped in explicit delimiter blocks (`<<<PLANNER_CONTEXT>>>`, `<<<STUDENT_INPUT>>>`, `<<<TOOL_RESULT>>>`) treated as pure data.
   - Comprehensive server-side schema validator (`toolValidator.js`) enforcing types, length caps, enum values, and calendar-valid ISO date formats.
   - Authorization boundary: `userId` is enforced from authenticated session (`req.user.userId`), never model arguments.

3. **Planner Data-Access Layer (`server/services/plannerRepository.js`):**
   - Created a clean repository layer (`getTodayTasks`, `getMissedTasks`, `addTask`, `rescheduleOverdue`, `getExams`, `getSubjects`, `getUser`).
   - Decouples chatbot tools and context builders from storage. Member B can swap in Mongoose models by modifying this single file.

4. **Flashcards & Quiz Mode (`client/src/components/flashcards/`, `server/routes/quizRoutes.js`):**
   - Schema validation for generated flashcards, capped at 10 cards per call.
   - Interactive 3D flip card deck and multiple-choice quiz engine with score calculation and weak-topic detection.
   - Real-time weak-topic banner highlighting subjects needing reinforcement.

5. **App Shell, Navigation & Integration Polish (`client/`):**
   - Auto-refresh: Chat tool executions (`create_task`, `reschedule_missed`) automatically update `plannerLastUpdated` and trigger store task refreshes without page reloads.
   - AI Engine Mode indicator: Displays "Gemini" (when `GEMINI_API_KEY` is present) or "Offline tutor" (deterministic smart tutor simulator).
   - Error Banner with Retry: Displays friendly error notice with a 1-click retry button when chat calls fail.
   - `ProtectedRoute` wrapper in `App.jsx` redirecting unauthenticated users to `/login`, paired with a 401 response handler in `api.js` that clears sessions.
   - Accessibility & Floating Chat: Floating chat supports Escape key dismissal, returns keyboard focus to the trigger button, includes ARIA dialog roles, and text contrast was raised across the UI to meet WCAG AA (>= 4.5:1).
   - Accurate countdown: "Days left" calculation computes local calendar midnight differences, preventing 24h floor/ceil offset bugs ("exam tomorrow" never displays 0 days).

6. **Repo, CI & Developer Experience:**
   - GitHub Actions CI (`.github/workflows/ci.yml`) runs frontend linting (`oxlint`), production build (`vite build`), client smoke tests (`vitest`), server tests (`jest`), and the live 21-case chatbot runner.
   - `.github/pull_request_template.md` and `CONTRIBUTING.md` defining branching rules and commit standards.
   - `.env.example` updated with `LLM_TIMEOUT_MS` and `LLM_MODEL`.
   - Removed all test simulation hooks (`x-test-llm-sim`) from production code in favor of modular dependency injection (`setGeminiCaller`).

---

## 2. Test Verification & Real Evidence

### A. Client Lint & Production Build
```bash
$ cd client && npm run lint
Found 7 warnings (all purely reactive dependencies / impure Date hooks) and 0 errors.

$ cd client && npm run build
vite v8.3.5 building client environment for production...
✓ 2081 modules transformed.
dist/index.html                   1.37 kB │ gzip:   0.74 kB
dist/assets/index-BAj8pyRj.css   73.38 kB │ gzip:  10.69 kB
dist/assets/index-kP961V08.js   385.56 kB │ gzip: 112.94 kB
✓ built in 157ms
```

### B. Client Smoke Tests (Vitest)
```bash
$ cd client && npm test
 ✓ src/test/smoke.test.jsx (4 tests) 153ms
   ✓ Client Smoke Tests (Member A Slice) (4)
     ✓ sends a chat message and displays the assistant reply in feed (71ms)
     ✓ displays error banner on chat failure and retries on button click (63ms)
     ✓ renders flashcard front and flips to back on user click (6ms)
     ✓ provides answer feedback and updates score on option selection (13ms)

Test Files  1 passed (1)
Tests       4 passed (4)
```

### C. Server Test Suite (Jest + Supertest)
```bash
$ cd server && npm test
PASS tests/chat.test.js
PASS tests/tools.test.js
PASS tests/quiz.test.js

Test Suites: 3 passed, 3 total
Tests:       31 passed, 31 total
Time:        0.487 s
```

### D. Chatbot Live Programmatic Test Runner (21 Cases)
```bash
$ node server/scripts/run-chat-tests.js
🧪 Starting StudyBuddy Chatbot Live Test Runner...
📡 In-process test instance active at http://127.0.0.1:49773
[Test 1] Schedule Awareness: PASS
[Test 2] Missed Task Rebalancing: PASS
[Test 3] Task Creation Tool: PASS
[Test 4] Concept Explanation: PASS
[Test 5] Comparative Doubt: PASS
[Test 6] Database Systems: PASS
[Test 7] Operating Systems: PASS
[Test 8] Empty Plan Edge Case: PASS
[Test 9] Off-Topic Question: PASS
[Test 10] Security: Prompt Injection: PASS
[Test 11] Security: SQL / Script Injection: PASS
[Test 12] Input Length Guardrail: PASS
[Test 13] Empty / Whitespace Query: PASS
[Test 15] Flashcard Generation Tool: PASS
[Test 16] Weak-Topic Followup: PASS
[Test 17] Missing API Key Fallback: PASS
[Test 18] Chat History Pagination: PASS
[Test 19] Fault Tolerance (EXTRA): PASS
[Test 20] Fault Tolerance (EXTRA): PASS
[Test 21] Injection Hardening (EXTRA): PASS
[Test 14] Rate Limiting: PASS

📄 Real test results written to: docs/chatbot-test-results.md
✅ All 21 chatbot test cases PASSED with real assertions!
```

---

## 3. Scope Boundaries & Teammate Integration

Per team lead responsibilities, this PR intentionally **does NOT** implement teammates' modules:
- Real auth and MongoDB User/Subject/Task/Session schemas are left for **Member B**.
- Calendar grid UI and subjects/topics CRUD are left for **Member C**.
- Timer session logging and Recharts visual analytics are left for **Member D**.

### How Teammates Integrate:
- **Member B:** Replace the in-memory arrays in `server/services/plannerRepository.js` with `await TaskModel.find({ userId })`, etc.
- **Member C & D:** Replace stub routes in `server/app.js` and render full UI components inside their respective pages (`PlannerPage.jsx`, `SubjectsPage.jsx`, `TimerPage.jsx`, `AnalyticsPage.jsx`).
