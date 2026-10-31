# StudyBuddy: Project Report Chapters (Member 1 — Team Lead)

**Author:** Monika Sharma (Member 1 — Team Lead + AI Chatbot & Quiz)  
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

## 4. System Architecture
StudyBuddy utilizes a decoupled client-server micro-architecture:

```
[ React 19 Frontend (Vite) ] <--- REST/JSON ---> [ Node.js Express Backend ] <--- Mongoose ---> [ MongoDB Atlas ]
   • App Shell & Responsive Layout                  • JWT Auth & Rate Limiting
   • Zustand Centralized State                      • Planner Context Builder
   • 3D Flashcard Deck & Quiz Mode                  • Chatbot Tool Calling Engine
   • Global Floating Chatbot Widget                 • Fallback Smart Tutor Service
   • Live Teammate Integration Stubs                • LLM Integration (Google Gemini)
```

### Security & Guardrail Layers:
- **Client-Side:** Sanitized inputs, character counting (2,000 max), immediate optimistic feedback.
- **API Boundary:** Strict CORS policies, `express-rate-limit` (30 requests/min/IP), token parsing middleware.
- **Server-Side Sanitization:** Input string validation, suppression of instruction-injection keywords (`ignore all previous instructions`, `<script>`).
- **Resilience Fallback:** Hybrid persistence with automatic fallback to high-speed in-memory store if the MongoDB cluster is offline, ensuring zero downtime during demonstrations.

---

## 5. Chatbot Design & Tool Calling Engine (Member 1 Core Deliverable)

### 5.1 System Prompt Design
The study tutor prompt implements pedagogical best practices:
- **Persona:** Encouraging, empathetic, and academically rigorous study coach.
- **Analogy Principle:** Explains technical abstractions using tangible real-world analogies (e.g., LIFO stacks as cafeteria plates, AVL balancing as pivot scales).
- **Mandatory Assessment:** Always ends concept explanations with one conceptual check question to stimulate active recall.
- **Absolute Schedule Grounding:** Strictly prohibited from inventing dates or tasks; relies entirely on injected planner context.

### 5.2 Dynamic Context Builder
Prior to dispatching requests to the LLM or local engine, the backend queries:
1. Student daily available hours and streak.
2. Upcoming exams within 14 days (with remaining days countdown).
3. Today's scheduled tasks (completed vs pending).
4. Overdue/missed tasks from past days.
5. Weak topics identified by the student's quiz history.
6. The last 5 conversational exchanges.

### 5.3 Tool Calling Architecture
The model can invoke 4 operational tools:
1. `get_today_plan`: Fetches today's study load, priority levels, and nearest exams.
2. `create_task`: Parses academic intents and adds structured tasks to the student's board.
3. `reschedule_missed`: Automatically rolls overdue tasks forward into today's schedule.
4. `generate_flashcards`: Dynamically synthesizes high-yield questions for specific topics.

---

## 6. Flashcard Deck, Quiz Mode & Weak-Topic Detection (⭐ Member 1 Feature)
- **3D Flip Card Component:** Leverages CSS `preserve-3d` and `rotateY(180deg)` transformations for tactile, realistic study card interactions.
- **Interactive Quiz Engine:** Offers timed multiple-choice assessments with instant option color coding, explanation displays, and confetti celebration effects on completion.
- **Algorithmic Weak-Topic Detection:** Automatically filters quiz questions with `lastResult === 'incorrect'`, aggregates them by subject/topic, and provides a 1-click bridge for the student to ask the AI Tutor for remedial clarification.

---

## 7. Future Scope
1. **Voice Study Mode:** Integrating Web Speech API for hands-free audio question-answering during Pomodoro breaks.
2. **Syllabus Document Ingestion:** Allowing students to upload course PDF syllabi for automated topic and exam date extraction via RAG (Retrieval-Augmented Generation).
3. **Collaborative Study Groups:** Shared flashcard decks and group peer challenges.

---

## 8. Conclusion
As Member 1 and Team Lead, I have established the complete architectural foundation for StudyBuddy. The application boasts an intuitive, high-performance App Shell, full-page and floating AI Study Tutor experiences, a dynamic Planner Context Builder, 4 executable tool actions, and an adaptive Flashcard & Quiz system with automated weak-topic detection. 

All modules owned by Member 1 are fully functional, thoroughly tested, and integrated with robust API contracts, positioning the team for seamless completion of subsequent phases.
