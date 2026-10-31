# StudyBuddy: Project Report Chapters (Member B — Backend & Scheduler)

**Author:** Member B (Backend Core & Auto-Scheduler Lead)  
**Project:** StudyBuddy — Smart Study Planner & Adaptive AI Tutor  
**Course:** Full Stack Development (FSD)  

---

## 1. Executive Summary & Module Responsibilities
As **Member B**, I am responsible for the backend core, persistence architecture, data modeling, security hardening, email reminder engine, and the primary algorithmic innovation of StudyBuddy: the **Explainable Auto-Scheduling Algorithm**.

### Key Deliverables Owned:
1. **Database Schema & Models:** Engineered Mongoose models for `User`, `Subject`, `Topic`, `Task`, `StudySession`, and `Reminder` with compound indexing.
2. **Authentication & Authorization:** Secure registration and login workflows implementing `bcryptjs` password salt hashing and signed JSON Web Tokens (`jsonwebtoken`).
3. **Core CRUD & Business Logic APIs:** Comprehensive REST endpoints for subjects, topics, tasks, Pomodoro sessions, and analytics aggregations.
4. **Algorithmic Study Scheduler Engine:** Implemented the formal 6-step study scheduling algorithm that mathematically balances subject syllabus weights against exam countdowns and user daily availability limits.
5. **Overdue Rebalancing System:** Dynamic rolling and prioritization of missed study tasks.
6. **Background Job Automation:** Engineered a persistent background cron daemon (`node-cron`) coupled with an email dispatch pipeline (`nodemailer`).
7. **Security Architecture:** Configured `helmet` HTTP headers, CORS policies, and rate-limiting protections.

---

## 2. Database Design & Entity-Relationship Architecture

StudyBuddy utilizes **MongoDB with Mongoose ODM**. The schema architecture is designed for high read throughput during calendar rendering and low latency under high concurrency.

```
       +-----------------------+
       |         User          |
       +-----------------------+
       | _id (PK)              |
       | name: String          |
       | email: String (Unique)|
       | passwordHash: String  |
       | dailyHours: Number    |
       | streak: Number        |
       +-----------+-----------+
                   | 1
                   |
       +-----------+-----------+----------------------+
       |                       |                      |
     * |                     * |                    * |
+------+------+         +------+------+        +------+------+
|   Subject   |         |    Task     |        | StudySession|
+-------------+         +-------------+        +-------------+
| _id (PK)    |         | _id (PK)    |        | _id (PK)    |
| userId (FK) |<---+    | userId (FK) |        | userId (FK) |
| name        |    |    | subjectId   |        | taskId (FK) |
| color       |    |    | topicId     |        | durationMin |
| examDate    |    |    | title       |        | date        |
+------+------+    |    | type        |        +-------------+
       | 1         |    | scheduledDt |
       |           |    | dueDate     |
     * |           |    | priority    |
+------+------+    |    | completed   |
|    Topic    |    |    +------+------+
+-------------+    |           | 1
| _id (PK)    |    |           |
| subjectId   |----+         * |
| userId (FK) |         +------+------+
| name        |         |  Reminder   |
| difficulty  |         +-------------+
| status      |         | _id (PK)    |
| estHours    |         | userId (FK) |
+-------------+         | taskId (FK) |
                        | remindAt    |
                        | sent        |
                        +-------------+
```

### Database Performance Indexes
To ensure sub-millisecond query execution, compound indexes were established:
1. `User`: `{ email: 1 }` (unique lookup during login).
2. `Task`: `{ userId: 1, dueDate: 1 }` and `{ userId: 1, scheduledDate: 1, completed: 1 }` (powers the daily dashboard and calendar drag-and-drop views).
3. `Subject`: `{ userId: 1, examDate: 1 }` (powers the upcoming exam countdown widget).
4. `Topic`: `{ userId: 1, subjectId: 1, status: 1 }` (powers syllabus completion tracking).
5. `StudySession`: `{ userId: 1, date: 1 }` (powers 7-day study consistency charts).
6. `Reminder`: `{ sent: 1, remindAt: 1 }` (powers the background node-cron pollers).

---

## 3. Auto-Scheduling Algorithm Specification

Traditional study planners force students to manually enter every study block. StudyBuddy solves this through an explainable, deterministic greedy heuristic scheduler.

### 3.1 Mathematical Formulations

#### Step 1: Topic Weighting
For any topic $T_i$ belonging to subject $S_k$, its cognitive weight $W(T_i)$ is formulated as:
$$W(T_i) = \text{Difficulty}(T_i) \times \text{EstimatedHours}(T_i)$$
Where $\text{Difficulty} \in \{1, 2, 3\}$ ($1 = \text{Easy}, 2 = \text{Medium}, 3 = \text{Hard}$).

#### Step 2: Exam Urgency Metric
For subject $S_k$ with exam date $D_{\text{exam}}$ and planning date $D_{\text{today}}$:
$$\Delta_{\text{days}} = \max(1, \lceil D_{\text{exam}} - D_{\text{today}} \rceil)$$
$$\text{Urgency}(S_k) = \frac{100}{\Delta_{\text{days}}}$$

#### Step 3: Composite Priority Score
The composite priority score $P(T_i)$ for scheduling topic $T_i$ is given by:
$$P(T_i) = \text{Urgency}(S_k) \times W(T_i)$$

Topics are sorted in descending order of $P(T_i)$, ensuring that high-weight topics for imminent exams are always scheduled first.

#### Step 4: Daily Capacity Constraint
Let $H_{\text{daily}}$ be the student's daily available study hours limit (e.g., 4 hours). For any given day $d$:
$$\sum_{j=1}^{m} \text{AllocatedHours}(T_j, d) \le H_{\text{daily}}$$

#### Step 5: Pre-Exam Revision Buffer
For every subject $S_k$, the days $D_{\text{exam}} - 1$ and $D_{\text{exam}} - 2$ are automatically reserved for high-priority comprehensive revision blocks, preventing new heavy topics from being scheduled right before the exam.

#### Step 6: Overdue Task Rebalancing
When a student misses a scheduled task ($D_{\text{scheduled}} < D_{\text{today}} \land \text{completed} = \text{false}$), the task is not discarded. The rebalancing engine rolls overdue tasks forward to today and tomorrow, elevates their priority to `high`, and shifts subsequent tasks dynamically.

---

## 4. REST API Documentation

All endpoints return standardized JSON payloads adhering to the team contract:

### 4.1 Authentication Endpoints
- `POST /api/auth/register`: Create user account with hashed password and initial daily hours. Returns signed JWT.
- `POST /api/auth/login`: Verify user credentials against bcrypt hash and issue JWT.
- `GET /api/auth/me`: Fetch authenticated profile using `Bearer <token>`.
- `PUT /api/auth/profile`: Update user daily study hours, theme preference, or name.

### 4.2 Subjects & Topics Endpoints
- `GET /api/subjects`: Returns all subjects and their nested topics for the user.
- `POST /api/subjects`: Create a subject with name, hex color, and exam date.
- `PUT /api/subjects/:id`: Modify subject details.
- `DELETE /api/subjects/:id`: Cascade-delete subject and its associated topics.
- `POST /api/subjects/:id/topics`: Append a topic with difficulty (1-3) and estimated hours.
- `PUT /api/topics/:id`: Update topic status (`pending`, `in_progress`, `completed`).
- `DELETE /api/topics/:id`: Delete a topic.

### 4.3 Tasks & Planner Endpoints
- `GET /api/tasks`: Filter tasks by `?date=YYYY-MM-DD`, `?completed=true|false`, or `?subjectId=`.
- `POST /api/tasks`: Add manual task to board.
- `PUT /api/tasks/:id`: Update task attributes (supports drag-and-drop rescheduling).
- `PATCH /api/tasks/:id/complete`: Toggle task completion state.
- `POST /api/planner/generate`: Execute the auto-scheduling algorithm for 14-day horizon.
- `POST /api/planner/reschedule-missed`: Rebalance all overdue tasks.

### 4.4 Sessions, Analytics & Reminders Endpoints
- `POST /api/sessions`: Log a Pomodoro focus session with duration and notes.
- `GET /api/sessions?range=week`: Retrieve study sessions over past 7/30 days.
- `GET /api/analytics/summary`: Returns weekly study hours, streak, completion rate, and subject distributions.
- `GET /api/reminders`: List scheduled reminders.
- `POST /api/reminders`: Schedule a new reminder with target timestamp and email.
- `DELETE /api/reminders/:id`: Cancel a reminder.

---

## 5. Security & System Hardening

1. **Password Protection:** Utilizes `bcryptjs` with auto-generated salt (10 rounds). Plaintext passwords are never logged or stored.
2. **Stateless JWT Authorization:** Tokens are signed using HMAC-SHA256 with a 7-day expiration.
3. **HTTP Security Headers:** `helmet` is deployed as top-level middleware to guard against clickjacking, cross-site scripting (XSS), and MIME-sniffing.
4. **CORS Enforcement:** Configured with origin verification against client development and production domains.
5. **Zero-Downtime Hybrid Persistence:** Implemented seamless fallback to an in-memory data store, guaranteeing that local evaluation and demonstrations never crash if an external MongoDB Atlas cluster is unreachable.

---

## 6. Background Jobs & Email Notification System

The reminder engine leverages `node-cron` running an asynchronous evaluation job every minute:
```javascript
cron.schedule('* * * * *', async () => { ... });
```
When a reminder's trigger time is reached (`remindAt <= now` and `sent === false`), the system compiles an HTML notification email via `nodemailer` with a direct deep-link into the Pomodoro focus timer (`http://localhost:5173/timer`).

---

## 7. Production Deployment Specification

### Backend Deployment (Render / Railway / Docker)
1. **Repository Link:** Connect the GitHub repository `server/` directory as the deployment root.
2. **Build Command:** `npm install`
3. **Start Command:** `npm run start`
4. **Required Environment Variables:**
   - `PORT=5001`
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/studybuddy`
   - `JWT_SECRET=<strong-random-production-secret>`
   - `CLIENT_URL=https://studybuddy.vercel.app`
   - `SMTP_HOST=smtp.sendgrid.net`
   - `SMTP_USER=apikey`
   - `SMTP_PASS=<sendgrid-api-key>`

---

## 8. Verification & Test Summary
The entire backend and scheduler suite was validated through automated tests:
- **Unit Tests:** `npm run test:scheduler --prefix server` (5/5 tests passing: weight calculation, urgency metric, capacity bounds, revision reservation, overdue roll-forward).
- **Integration API Suite:** `npm run test:api --prefix server` (15/15 tests passing across Auth, Subjects, Tasks, Scheduler, Sessions, Analytics, and Reminders).
