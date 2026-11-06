# StudyBuddy — Shared REST API Contract Specification

This document defines the formal REST API contract implemented in StudyBuddy. Every protected route requires a valid JSON Web Token passed in the standard header:
`Authorization: Bearer <jwt_token>`

All endpoints return uniform JSON envelopes containing `success: true | false`.

---

## 1. Authentication & User Profile (`/api/auth` & `/api/user`)

### POST `/api/auth/register`
- **Access**: Public
- **Validation**: Zod schema (`email` valid, `password` min 8 chars, `name` min 2 chars, `dailyHours` 1-12).
- **Request Body**:
  ```json
  {
    "name": "Alex Chen",
    "email": "student@studybuddy.dev",
    "password": "Password123!",
    "dailyHours": 4
  }
  ```
- **Response 201**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "672c...",
      "name": "Alex Chen",
      "email": "student@studybuddy.dev",
      "dailyHours": 4,
      "theme": "dark"
    }
  }
  ```

### POST `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@studybuddy.dev",
    "password": "Password123!"
  }
  ```
- **Response 200**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { ... }
  }
  ```

### GET `/api/auth/me`
- **Access**: Protected (`Authorization: Bearer <token>`)
- **Response 200**:
  ```json
  {
    "success": true,
    "user": {
      "id": "672c...",
      "name": "Alex Chen",
      "email": "student@studybuddy.dev",
      "dailyHours": 4,
      "theme": "dark"
    }
  }
  ```

### PUT `/api/user/profile`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "name": "Alex C.",
    "dailyHours": 5,
    "theme": "dark"
  }
  ```
- **Response 200**: Returns updated user object.

---

## 2. Subjects & Topics (`/api/subjects` & `/api/topics`)

### GET `/api/subjects`
- **Access**: Protected (Scoped strictly to `req.user.userId`)
- **Response 200**:
  ```json
  {
    "success": true,
    "count": 3,
    "subjects": [
      {
        "id": "672c...",
        "name": "Data Structures & Algorithms",
        "code": "CS301",
        "color": "#6366f1",
        "examDate": "2026-11-12T00:00:00.000Z",
        "topicsCount": 3
      }
    ]
  }
  ```

### POST `/api/subjects`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "name": "Database Management Systems",
    "code": "CS304",
    "color": "#10b981",
    "examDate": "2026-11-18"
  }
  ```
- **Response 201**: Returns created subject object.

### GET `/api/subjects/:id/topics`
- **Access**: Protected
- **Response 200**: Returns array of topics with difficulty (1-3), estimatedHours, and status.

### POST `/api/topics`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "subjectId": "672c...",
    "name": "B+ Tree Indexing",
    "difficulty": 3,
    "estimatedHours": 3
  }
  ```

---

## 3. Tasks & Auto-Scheduler (`/api/tasks` & `/api/planner`)

### GET `/api/tasks`
- **Access**: Protected
- **Query Params**: `?date=YYYY-MM-DD` or `?completed=false`
- **Response 200**: Returns array of tasks scoped to student.

### POST `/api/tasks`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "title": "Review Dynamic Programming",
    "subjectId": "672c...",
    "durationHours": 2,
    "priority": "high",
    "dueDate": "2026-11-06"
  }
  ```

### PATCH `/api/tasks/:id/complete`
- **Access**: Protected
- **Response 200**:
  ```json
  {
    "success": true,
    "task": {
      "id": "672c...",
      "completed": true,
      "completedAt": "2026-11-06T15:00:00.000Z"
    }
  }
  ```

### POST `/api/planner/generate`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "commit": false
  }
  ```
- **Response 200**:
  ```json
  {
    "success": true,
    "committed": false,
    "tasksCount": 5,
    "planSummary": {
      "totalHoursScheduled": 12.5,
      "revisionTasksCount": 2,
      "studyTasksCount": 3
    },
    "tasks": [ ... ]
  }
  ```

### POST `/api/planner/reschedule`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "commit": true
  }
  ```
- **Response 200**: Rolls forward overdue tasks into today or tomorrow within daily hours capacity.

---

## 4. Study Sessions & Analytics (`/api/sessions` & `/api/analytics`)

### POST `/api/sessions`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "subjectId": "672c...",
    "subjectName": "Data Structures & Algorithms",
    "durationMin": 25,
    "date": "2026-11-06",
    "notes": "Focused Pomodoro interval"
  }
  ```
- **Response 201**: Returns created session record.

### GET `/api/analytics/summary`
- **Access**: Protected
- **Response 200**:
  ```json
  {
    "success": true,
    "summary": {
      "streak": 4,
      "totalHours": 14.5,
      "completedTasksCount": 8,
      "pendingTasksCount": 3,
      "dailyHoursLogged": [
        { "day": "Mon", "date": "2026-11-03", "hours": 2.5 },
        { "day": "Tue", "date": "2026-11-04", "hours": 3.0 },
        { "day": "Wed", "date": "2026-11-05", "hours": 4.0 },
        { "day": "Thu", "date": "2026-11-06", "hours": 1.5 }
      ],
      "subjectDistribution": [
        { "name": "Data Structures", "hours": 8.0, "color": "#6366f1" },
        { "name": "DBMS", "hours": 4.5, "color": "#10b981" },
        { "name": "Operating Systems", "hours": 2.0, "color": "#f59e0b" }
      ]
    }
  }
  ```

---

## 5. AI Chatbot & Quiz Engine (`/api/chat` & `/api/quiz`)

### POST `/api/chat`
- **Access**: Protected
- **Rate Limit**: 30 requests per minute
- **Request Body**:
  ```json
  {
    "message": "What should I study today?"
  }
  ```
- **Response 200**:
  ```json
  {
    "reply": "Hey there! 👋 Based on your study plan...",
    "toolCalls": [
      {
        "tool": "get_today_plan",
        "arguments": {},
        "result": { ... }
      }
    ]
  }
  ```

### GET `/api/chat/history`
- **Access**: Protected
- **Query Params**: `?limit=20`
- **Response 200**: Returns recent conversation messages.

### POST `/api/quiz/generate`
- **Access**: Protected
- **Request Body**: `{ "topic": "AVL Trees", "subject": "Data Structures", "count": 3 }`
- **Response 200**: Returns generated interactive flashcard/quiz questions.

### POST `/api/quiz/result`
- **Access**: Protected
- **Request Body**: `{ "cardId": "672c...", "result": "correct" }`
- **Response 200**: Updates card stats and returns `{ "status": "mastered" | "weak" }`.

### GET `/api/quiz/weak-topics`
- **Access**: Protected
- **Response 200**: Returns aggregated weak topics where incorrect answers exceed threshold.

---

## 6. System Health Check (`/api/health`)
- **Access**: Public
- **Response 200**:
  ```json
  {
    "status": "online",
    "app": "StudyBuddy API",
    "aiMode": "Gemini",
    "llmModel": "gemini-3.5-flash-lite",
    "database": {
      "connected": true,
      "mode": "MongoDB Atlas"
    },
    "timestamp": "2026-11-06T15:20:00.000Z"
  }
  ```
