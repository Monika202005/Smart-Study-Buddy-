# StudyBuddy — Contributing & Team Workflow Guide

Welcome to the **StudyBuddy** repository! This document defines the engineering standards, branching strategy, commit conventions, and pull request workflows for our team of 4.

---

## 1. Git Branching Strategy

Our team operates on a structured Git flow to prevent merge conflicts and isolate member slices:

```
main (Production / Tagged Deliverable)
  ▲
  └── dev (Integration & Pre-Release Testing)
        ▲
        ├── feature/lead-hardening (Member A - Chatbot, Tools, Guardrails)
        ├── feature/lead-finish    (Member A - Polish, App Shell, Docs)
        ├── feature/backend-auth   (Member B - Models, JWT Auth, Scheduler)
        ├── feature/planner-ui     (Member C - Calendar & Topics CRUD)
        └── feature/analytics-ui   (Member D - Timer Logging, Recharts)
```

### Branch Rules
1. **`main`**: Protected branch representing stable, evaluated deliverable releases. Direct pushes and direct merges from feature branches are prohibited.
2. **`dev`**: Central integration branch. All teammate feature branches branch off `dev` and merge into `dev` via pull requests.
3. **`feature/<name>`**: Individual member slice work. Branch names must be descriptive (e.g., `feature/lead-finish`, `feature/real-auth`, `feature/planner-calendar`).

---

## 2. Commit Message Standards

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):

Format: `<type>(<optional scope>): <description>`

### Allowed Types
- **`feat:`** A new user-facing feature or API capability (e.g., `feat: add LLM timeout and single-retry policy`)
- **`fix:`** Bug fix or regression patch (e.g., `fix: compute exam days left using local midnight calendar difference`)
- **`test:`** Unit, integration, smoke, or test runner additions (e.g., `test: add Vitest smoke tests for chat and flashcard flip`)
- **`docs:`** Documentation, architectural diagrams, reports (e.g., `docs: add chatbot architecture diagram and demo script`)
- **`refactor:`** Code changes that neither fix a bug nor add a feature (e.g., `refactor: decouple planner queries into plannerRepository`)
- **`chore:`** Dependency updates, CI workflow, or configuration adjustments (e.g., `chore: update GitHub Actions CI workflow`)

### Commit Hygiene
- Keep commits focused and atomic.
- Commit messages must be written in imperative mood ("add", not "added").
- Never bundle unrelated changes across different teammate slices into a single commit.

---

## 3. Pull Request & Review Standards

1. **Target Branch**: Every PR must target `dev` (never `main`).
2. **Pull Request Template**: Fill out `.github/pull_request_template.md` completely, including module ownership, test output evidence, and security verification.
3. **Review Approval**: Every PR requires review and approval from at least one teammate (or the Team Lead) before merging.
4. **CI Passing**: GitHub Actions workflow must pass all checks:
   - `client` oxlint check
   - `client` Vite production build
   - `client` Vitest smoke tests
   - `server` Jest + Supertest suite
   - `server` 21-case programmatic chatbot test runner

---

## 4. Security & Environment Protection

- **NEVER** print, edit, stage, or commit any `.env` file or API key to Git.
- Use `.env.example` as the canonical template for any new environment variable.
- All authorization decisions must use `req.user.userId` from authenticated tokens, never raw client-supplied parameters.
- All model inputs, tool arguments, and context injections must be strictly sanitized and schema-validated before execution.

---

## 5. Teammate Integration Guide

- **Member A (Lead)**: Chatbot, Tool Calling, Flashcard & Quiz Engine, App Shell. Integration point is `server/services/plannerRepository.js` and `docs/api-contract.md`.
- **Member B**: Replaces mock repository implementations in `plannerRepository.js` with live Mongoose queries once `User`, `Subject`, and `Task` schemas land.
- **Member C & D**: Replace the stub routes in `server/app.js` and integrate their frontend pages into the shared responsive `AppShell`.
