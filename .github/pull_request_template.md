## Pull Request Summary

### 1. Module / Slice
- [ ] Member A (Team Lead): Chatbot, Tool Calling, Flashcards & Quiz Engine, App Shell
- [ ] Member B: Database, Auth, Task & Subject Models, Auto-Scheduler
- [ ] Member C: Calendar & Study Planner Board, Syllabus & Topics Management
- [ ] Member D: Study Analytics, Timer Session Logging, Settings

### 2. Description of Changes
*Brief 2-3 sentence overview of what this pull request introduces or fixes.*

### 3. Branch & Workflow Compliance
- [ ] Branched from `dev` (or preceding feature branch per project plan)
- [ ] Conventional Commit format used (e.g., `feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- [ ] Targets `dev` branch for merge (never merge directly into `main`)
- [ ] Peer reviewed by at least one teammate prior to merge

### 4. Verification & Testing Evidence
*Paste actual command output or test runs executed locally:*
- [ ] Frontend Lint passed (`cd client && npm run lint`)
- [ ] Frontend Build passed (`cd client && npm run build`)
- [ ] Client Tests passed (`cd client && npm test`)
- [ ] Server Tests passed (`cd server && npm test`)
- [ ] Chatbot Live Test Suite passed (`node server/scripts/run-chat-tests.js`)

```bash
# Paste test run results below:
```

### 5. Security & Boundary Guardrails
- [ ] No secrets, API keys, or `.env` files committed
- [ ] Authenticated `req.user.userId` enforced on all database and tool queries
- [ ] Input validation schemas enforced on all endpoint bodies/queries

### 6. Known Limitations / Teammate Integration Notes
*Notes for other team members on how to integrate with these changes.*
