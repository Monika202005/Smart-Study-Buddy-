# StudyBuddy — Shared API Contract Specification

This document defines the formal REST API contract agreed upon in Week 1 by the team lead (Member 1) to enable decoupled, parallel development across all 4 team members.

---

## 1. Authentication Endpoints (Member B)
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

## 2. Subjects & Topics Endpoints (Member B & C)
- **GET `/api/subjects`**
  - **Response 200**: `{ "success": true, "subjects": [ { "id": "cs301", "name": "DSA", "color": "#6366f1", "examDate": "2026-11-05", "topics": [...] } ] }`
- **POST `/api/subjects`**
  - **Body**: `{ "name": "string", "color": "#hex", "examDate": "YYYY-MM-DD" }`
- **GET `/api/subjects/:id/topics`**
  - **Response 200**: `{ "success": true, "topics": [ { "id": "t1", "name": "AVL Trees", "difficulty": 2, "estimatedHours": 3, "status": "pending" } ] }`

---

## 3. Tasks & Auto-Scheduler Endpoints (Member B & C)
- **GET `/api/tasks`**
  - **Query**: `?date=YYYY-MM-DD` or `?completed=false`
  - **Response 200**: `{ "success": true, "tasks": [ { "id": "task_1", "title": "AVL Trees", "priority": "high", "completed": false, "scheduledDate": "2026-10-31" } ] }`
- **POST `/api/tasks`**
  - **Body**: `{ "title": "string", "subjectId": "string", "durationHours": 2, "priority": "high", "dueDate": "YYYY-MM-DD" }`
- **PATCH `/api/tasks/:id/complete`**
  - **Response 200**: `{ "success": true, "task": { "id": "task_1", "completed": true } }`
- **POST `/api/planner/generate`**
  - **Response 200**: `{ "success": true, "message": "Plan generated", "plan": { ... } }`
- **POST `/api/planner/reschedule-missed`**
  - **Response 200**: `{ "success": true, "rescheduledCount": 1, "tasks": [...] }`

---

## 4. AI Chatbot & Context Endpoints (⭐ Member 1 — Complete & Live)
- **POST `/api/chat`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ "message": "string", "userId": "string" }`
  - **Guardrails**: Max 2,000 characters, rate limited to 30 req/min, sanitized against prompt-injections.
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
      "timestamp": "2026-10-31T08:00:00.000Z"
    }
    ```
- **GET `/api/chat/history`**
  - **Query**: `?userId=string&limit=50&before=ISODate`
  - **Response 200**: `{ "success": true, "count": 10, "messages": [...] }`
- **DELETE `/api/chat/history`**
  - **Response 200**: `{ "success": true, "message": "Chat history cleared" }`

---

## 5. Flashcards & Quiz Mode Endpoints (⭐ Member 1 — Complete & Live)
- **POST `/api/quiz/generate`**
  - **Body**: `{ "topic": "B+ Trees", "subject": "DBMS", "count": 3 }`
  - **Response 200**: `{ "success": true, "cards": [...] }`
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
      "totalWeakTopics": 2,
      "weakTopics": [
        {
          "subjectName": "Data Structures & Algorithms",
          "topicName": "Binary Search Trees",
          "missedCount": 1,
          "sampleQuestions": ["..."]
        }
      ],
      "recommendation": "Review the following 2 topic(s)..."
    }
    ```

---

## 6. Pomodoro Sessions & Analytics Endpoints (Member D)
- **POST `/api/sessions`**
  - **Body**: `{ "taskId": "string", "durationMin": 25, "date": "YYYY-MM-DD" }`
- **GET `/api/sessions?range=week`**
  - **Response 200**: `{ "success": true, "sessions": [...] }`
- **GET `/api/analytics/summary`**
  - **Response 200**: `{ "success": true, "summary": { "totalStudyHoursThisWeek": 16.5, "streakDays": 4, "completionRatePercent": 78, "hoursBySubject": [...] } }`
