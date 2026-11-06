# StudyBuddy — Auto-Scheduler & Backend API Test Matrix (Member B)

This document records the verification matrix for the **Auto-Scheduler Algorithm** and **Backend Core APIs** developed by Member B (Backend + Scheduler Lead).

---

## 1. Algorithmic Scheduler Verification Matrix (Section 8, 14 & 20)

| Test ID | Algorithmic Rule | Test Scenario & Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|:---:|
| **SCH-01** | Rule 1: Topic Weighting | Compute weight for Topic with Difficulty = 3, Hours = 4 | $\text{Weight} = 3 \times 4 = 12$ | Returned exactly 12 | **PASS** |
| **SCH-02** | Rule 3: Exam Urgency | Compare urgency for Exam A (3 days left) vs Exam B (12 days left) | $\text{Urgency}(A) > \text{Urgency}(B)$ | Exam A: 33.33, Exam B: 8.33 | **PASS** |
| **SCH-03** | Rule 4: Daily Capacity Limit | User `dailyHours = 4`, schedule 3 subjects across 14 days | For every day $d$, $\sum \text{TaskHours}(d) \le 4.0\text{h}$ | Max hours per day was $\le 4.0\text{h}$ across entire horizon | **PASS** |
| **SCH-04** | Rule 2 & 5: Revision Buffer | Pre-exam scheduling 1–2 days before subject exam dates | Generates reserved pre-exam revision blocks with priority "high" | Revision tasks successfully generated for closest exams | **PASS** |
| **SCH-05** | Rule 6: Overdue Rebalancing | 1 overdue task scheduled yesterday with `completed: false` | Task rolled forward to today/tomorrow, marked `isRescheduled: true` | Task rebalanced to current date with high priority | **PASS** |

---

## 2. Backend Core API Test Matrix (Section 7)

| Test ID | Endpoint | Method | Test Input / Action | Expected Result | Status |
|---|---|:---:|---|---|:---:|
| **API-01** | `/api/health` | GET | Request service health status | HTTP 200, status: "online", member2 active | **PASS** |
| **API-02** | `/api/auth/register` | POST | Unique email, name, password, dailyHours | HTTP 201, bcrypt hash stored, JWT token issued | **PASS** |
| **API-03** | `/api/auth/login` | POST | Valid registered credentials | HTTP 200, JWT token returned, user object returned | **PASS** |
| **API-04** | `/api/auth/me` | GET | Valid Bearer token in header | HTTP 200, student profile matches token identity | **PASS** |
| **API-05** | `/api/subjects` | GET | Authenticated student request | HTTP 200, array of subjects with embedded topics | **PASS** |
| **API-06** | `/api/subjects` | POST | Subject name, color, and exam date | HTTP 201, subject persisted in database | **PASS** |
| **API-07** | `/api/subjects/:id/topics` | POST | Topic name, difficulty (1-3), estimated hours | HTTP 201, topic linked to subject | **PASS** |
| **API-08** | `/api/tasks` | GET | Query all tasks or filter by date | HTTP 200, sorted chronologically | **PASS** |
| **API-09** | `/api/tasks` | POST | Task title, subject, duration, priority | HTTP 201, task scheduled on planner board | **PASS** |
| **API-10** | `/api/tasks/:id/complete` | PATCH | Toggle task completion flag | HTTP 200, `completed: true`, timestamp saved | **PASS** |
| **API-11** | `/api/planner/generate` | POST | Trigger algorithmic plan generation | HTTP 200, full 14-day balanced plan generated | **PASS** |
| **API-12** | `/api/planner/reschedule-missed`| POST | Rebalance all overdue tasks | HTTP 200, count of rebalanced tasks returned | **PASS** |
| **API-13** | `/api/sessions` | POST | Log 25-minute Pomodoro study block | HTTP 201, session stored for analytics | **PASS** |
| **API-14** | `/api/analytics/summary` | GET | Fetch calculated statistics | HTTP 200, hours by subject, consistency, streak | **PASS** |
| **API-15** | `/api/reminders` | POST/GET| Schedule reminder with email and time | HTTP 201 created, HTTP 200 fetched, cron active | **PASS** |

---

## 3. Automated Test Command Reference
- **Run scheduler unit tests**: `npm run test:scheduler --prefix server`
- **Run API verification suite**: `npm run test:api --prefix server`
