# StudyBuddy — Production Deployment Guide

This guide details how to deploy the full-stack StudyBuddy multi-user application to cloud infrastructure:
- **Backend API**: [Render](https://render.com) (or Railway / Fly.io / AWS ECS)
- **Frontend SPA**: [Vercel](https://vercel.com) (or Netlify / Cloudflare Pages)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed M0/M10 Cluster)
- **AI Core**: [Google Gemini API](https://ai.google.dev) (`gemini-3.5-flash-lite` or `gemini-flash-latest`)

---

## 1. MongoDB Atlas Configuration

1. **Create an Atlas Cluster**:
   - Log into MongoDB Atlas and create an M0 (Free Tier) or M10 shared cluster in your preferred AWS/GCP region.
   - Name the database cluster (e.g. `StudyBuddyCluster`).

2. **Configure Database Access (User)**:
   - Go to **Security > Database Access**.
   - Create a database user with `readWriteAnyDatabase` or scoped read/write access to the `studybuddy` database.
   - Use a strong generated password.

3. **Configure Network Access (IP Whitelist)**:
   - Go to **Security > Network Access**.
   - Add IP Access: `0.0.0.0/0` (Allow Access from Anywhere) to permit cloud runtime instances (Render, Railway, serverless workers) to connect securely over TLS.

4. **Obtain Connection String**:
   - Click **Connect > Drivers > Node.js (version 5.5 or later)**.
   - Copy the SRV URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/studybuddy?retryWrites=true&w=majority&appName=StudyBuddyCluster
     ```
   - Ensure the database name in the path is `studybuddy`.

---

## 2. Backend Deployment (Render)

### Option A: Using Render Blueprint (`render.yaml`)
1. Fork or push the StudyBuddy repository to GitHub.
2. In Render Dashboard, click **New > Blueprint**.
3. Select your repository. Render automatically reads [render.yaml](../render.yaml).
4. Fill in the required secret environment variables (`MONGODB_URI`, `CLIENT_URL`, `GEMINI_API_KEY`).
5. Click **Apply**.

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure service settings:
   - **Name**: `studybuddy-api`
   - **Region**: Choose closest to your MongoDB Atlas cluster
   - **Branch**: `main` or your production release branch
   - **Root Directory**: (Leave blank or set to repo root)
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Health Check Path**: `/api/health`
4. Add Environment Variables under **Environment**:

| Variable | Description | Recommended Production Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | HTTP Server port | `5001` (or Render default `$PORT`) |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | `mongodb+srv://.../studybuddy?...` |
| `JWT_SECRET` | Secret key for signing student JWTs (min 32 chars) | Strongly generated random string |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `CLIENT_URL` | Production frontend domain for CORS | `https://your-studybuddy.vercel.app` |
| `GEMINI_API_KEY` | Google AI Studio API key | Valid Gemini API Key |
| `LLM_MODEL` | Google Gemini model name | `gemini-3.5-flash-lite` |
| `LLM_TIMEOUT_MS` | AI gateway timeout cap | `15000` |

---

## 3. Frontend Deployment (Vercel)

1. In Vercel Dashboard, click **Add New > Project**.
2. Import the GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click "Edit" and choose `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add Environment Variable:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Live URL of your deployed Render backend | `https://studybuddy-api.onrender.com` |

5. Deploy. Vercel automatically applies [client/vercel.json](../client/vercel.json) to handle Single Page Application (SPA) routing so direct visits to `/login`, `/app/dashboard`, etc. work cleanly without 404s.

---

## 4. Production Database Seeding

After your backend is live and connected to MongoDB Atlas, seed initial academic data for testing:

```bash
# From local terminal with server/.env configured with production MONGODB_URI:
cd server
npm run seed -- --reset
```

This creates the default demo user:
- **Email**: `student@studybuddy.dev`
- **Password**: `password123`
- Pre-populated with 3 subjects, syllabus topics, study tasks, and flashcards.

---

## 5. Post-Deployment Verification

Verify your live deployment with the automated smoke suite:

```bash
# Run against the live production API
TEST_API_URL=https://studybuddy-api.onrender.com node scripts/smoke.js
```

Expected output:
```text
🚀 --- StudyBuddy Production Smoke Test Suite ---
📡 Target external server: https://studybuddy-api.onrender.com
[1/6] Verifying Health Check Endpoint (/api/health)...
  ✅ Health check passed. Status: online, DB: MongoDB Atlas
[2/6] Verifying User Registration & Authentication (/api/auth)...
  ✅ User A registered and received valid JWT token.
[3/6] Verifying Two-User Data Isolation (Zero Leakage)...
  ✅ Confirmed: User B cannot view User A subjects.
[4/6] Verifying Planner Generation & Reschedule API (/api/planner)...
  ✅ Plan preview generated
[5/6] Verifying Study Session Logging (/api/sessions)...
  ✅ Pomodoro session logged
[6/6] AI Chatbot & Tool Calling (/api/chat)...
  ✅ AI Chatbot replied successfully (Tools: 1)
🎉 ALL 6 PRODUCTION SMOKE TESTS PASSED CLEANLY!
```

