# StudyBuddy — Shared API Contract Specification

This document defines the formal REST API contract agreed upon by the team to enable decoupled, parallel development across all 4 team members:
- **Member A (Lead)**: AI Chatbot, Tool Calling, Flashcards & Quiz Engine, App Shell.
- **Member B**: Backend Core, Auth, Mongoose Models, Scheduler.
- **Member C**: Planner UI, Calendar, Subjects & Topics.
- **Member D**: Dashboard Layout, Pomodoro Timer, Analytics.

---

## 1. Authentication Endpoints (Member B Ownership)
*Status: Contract Stubs Active (Mock user returned; ready for Member B JWT & bcrypt implementation)*

- **POST `/api/auth/register`**
  - **Body**: `{ "name": "string", "email": "string", "password": "string", "dailyHours": 4 }`
  - **Response 201**: `{ "success": true, "token": "jwt_token", "user": { "id": "...", "name": "..." } }`
- **POST `/api/auth/login`**
  - **Body**: `{ "email": "string", "password": "string" }`
  - **Response 200**: `{ "success": true, "token": "jwt_token", "user": { ... } }`
- **GET `/api/auth/me`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response 200**: `{ "success": true, "user": { ... } }`

---

## 2. Subjects & Topics Endpoints (Member B & C Ownership)
*Status: Contract Stubs Active (Mock store populated with CS301, CS304, CS308)*

- **GET `/api/subjects`**
  - **Response 200**: `{ "success": true, "count": 3, "subjects": [ { "id": "cs301", "name": "Data Structures & Algorithms", "color": "#6366f1", "examDate": "YYYY-MM-DD", "topics": [...] } ] }`
- **POST `/api/subjects`**
  - **Body**: `{ "name": "string", "color": "#hex", "examDate": "YYYY-MM-DD" }`
- **GET `/api/subjects/:id/topics`**
  - **Response 200**: `{ "success": true, "topics": [ { "id": "t1", "name": "AVL Trees", "difficulty": 2, "estimatedHours": 3, "status": "pending" } ] }`

---

## 3. Tasks & Auto-Scheduler Endpoints (Member B & C Ownership)
*Status: Contract Stubs Active (Auto-schedule and reschedule hooks working with mock store)*

- **GET `/api/tasks`**
  - **Query**: `?date=YYYY-MM-DD` or `?completed=false`
  - **Response 200**: `{ "success": true, "count": 4, "tasks": [ { "id": "task_1", "title": "Implement AVL Tree rotation", "priority": "high", "completed": false, "scheduledDate": "YYYY-MM-DD" } ] }`
- **POST `/api/tasks`**
  - **Body**: `{ "title": "string", "subjectId": "string", "durationHours": 2, "priority": "high", "dueDate": "YYYY-MM-DD" }`
- **PATCH `/api/tasks/:id/complete`**
  - **Response 200**: `{ "success": true, "task": { "id": "task_1", "completed": true } }`
- **POST `/api/planner/generate`**
  - **Response 200**: `{ "success": true, "message": "Plan generated", "plan": { ... } }`
- **POST `/api/planner/reschedule-missed`**
  - **Response 200**: `{ "success": true, "rescheduledCount": 1, "tasks": [...] }`

---

## 4. AI Chatbot & Context Endpoints (⭐ Member A Ownership — Real & Hardened)
*Status: ✅ Real, Hardened & Automated Tested (31 Jest tests + 21 chat runner tests)*

- **POST `/api/chat`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ "message": "string" }`
  - **Security & Reliability**:
    - `userId` extracted strictly from `req.user.userId` (from `authMiddleware`).
    - Input normalization (lowercasing, zero-width stripping, whitespace collapsing) and prompt isolation (`<<<STUDENT_INPUT>>>`, `<<<PLANNER_CONTEXT>>>`).
    - Input length validation (1 to 2,000 characters).
    - Rate limit: 30 requests per minute per IP.
    - Timeout protection: 15s default via `AbortController`.
    - Retry policy: exactly 1 retry for timeouts, network drops, HTTP 429 and 5xx (no retry on 4xx).
    - Friendly tutor fallback response on second failure (never a 500 error).
    - Tools run ONLY when the model emits a tool call (up to 3 iterations per turn).
  - **Response 200**:
    ```json
    {
      "success": true,
      "reply": "### 📅 Study Plan\nHere is your plan...",
      "toolCalls": [
        {
          "tool": "get_today_plan",
          "arguments": {},
          "result": { "success": true, "todayTasks": [...] }
        }
      ],
      "messageId": "msg_a_1234",
      "timestamp": "2026-11-06T02:00:00.000Z"
    }
    ```
- **GET `/api/chat/history`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Query**: `?limit=50&before=ISODate`
  - **Response 200**: `{ "success": true, "count": 10, "messages": [...] }`
- **DELETE `/api/chat/history`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response 200**: `{ "success": true, "message": "Chat history cleared successfully." }`

---

## 5. Flashcards & Quiz Mode Endpoints (⭐ Member A Ownership — Real & Hardened)
*Status: ✅ Real, Hardened & Automated Tested*

- **POST `/api/quiz/generate`**
  - **Body**: `{ "topic": "B+ Trees", "subject": "DBMS", "count": 3 }`
  - **Validation**: `count` capped at 10; topic required; uses real LLM with JSON schema validation and curated fallbacks.
  - **Response 200**: `{ "success": true, "count": 3, "cards": [...] }`
- **POST `/api/quiz/result`**
  - **Body**: `{ "cardId": "string", "result": "correct" | "incorrect", "selectedOption": "string" }`
  - **Response 200**: `{ "success": true, "message": "Marked as mastered", "card": { ... } }`
- **GET `/api/quiz/flashcards`**
  - **Query**: `?subjectId=cs301&status=incorrect`
  - **Response 200**: `{ "success": true, "count": 5, "cards": [...] }`
- **GET `/api/quiz/weak-topics`**
  - **Response 200**:
    ```json
    {
      "success": true,
      "totalWeakTopics": 1,
      "weakTopics": [
        {
          "subjectName": "Data Structures & Algorithms",
          "topicName": "Binary Search Trees",
          "missedCount": 1,
          "sampleQuestions": ["What is the worst-case time complexity of searching in an unbalanced BST?"]
        }
      ],
      "recommendation": "Review the following 1 topic(s) with your AI Study Tutor before your next exam!"
    }
    ```

---

## 6. Analytics Endpoints (Member D Ownership)
*Status: Contract Stubs Active (Returns realistic metrics for student Monika)*

- **GET `/api/analytics/summary`**
  - **Response 200**:
    ```json
    {
      "success": true,
      "summary": {
        "totalStudyHoursThisWeek": 16.5,
        "streakDays": 4,
        "completionRatePercent": 78,
        "hoursBySubject": [
          { "subject": "Data Structures", "hours": 7.5 },
          { "subject": "DBMS", "hours": 5.0 },
          { "subject": "Operating Systems", "hours": 4.0 }
        ]
      }
    }
    ```

---

## 7. Integration Notes for Teammates

### Data Access Layer (`server/services/plannerRepository.js`):
Member B can swap the in-memory data store for Mongoose/MongoDB Atlas by updating `plannerRepository.js` only:
- `getTodayTasks(userId)`
- `getMissedTasks(userId)`
- `addTask(userId, taskData)`
- `rescheduleOverdue(userId)`
- `getExams(userId, days)`
- `getSubjects(userId)`
- `getUser(userId)`
Neither `chatbotService.js` nor `chatbotTools.js` require any modifications during database integration.
