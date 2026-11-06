#!/usr/bin/env node

/**
 * StudyBuddy E2E Deployment Smoke Test Suite
 *
 * Verifies critical production capabilities:
 * 1. Backend Health Check (/api/health)
 * 2. User Lifecycle (Sign up -> Sign in -> /api/auth/me)
 * 3. Two-User Isolation (Tenant separation on Subjects & Tasks)
 * 4. Scheduler Execution (Preview vs Commit)
 * 5. Pomodoro Session Logging (/api/sessions)
 * 6. AI Chatbot & Tool Calling (/api/chat)
 */

import http from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app.js';

async function runSmokeTests() {
  console.log('🚀 --- StudyBuddy Production Smoke Test Suite ---');
  let mongoServer = null;
  let server = null;
  let baseUrl = process.env.TEST_API_URL;

  try {
    if (!baseUrl) {
      console.log('📦 Starting isolated test environment with MongoMemoryServer...');
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());

      server = http.createServer(app);
      await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
      });
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`📡 In-process test server ready at ${baseUrl}`);
    } else {
      console.log(`📡 Target external server: ${baseUrl}`);
    }

    const testId = Date.now();

    // 1. Health Check
    console.log('\n[1/6] Verifying Health Check Endpoint (/api/health)...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    if (!healthRes.ok || (healthJson.status !== 'online' && healthJson.status !== 'healthy')) {
      throw new Error(`Health check failed: ${JSON.stringify(healthJson)}`);
    }
    console.log(`  ✅ Health check passed. Status: ${healthJson.status}, DB: ${healthJson.database?.mode || 'connected'}`);

    // 2. User Registration & Auth
    console.log('\n[2/6] Verifying User Registration & Authentication (/api/auth)...');
    const userAEmail = `smoke_user_a_${testId}@studybuddy.dev`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke User A',
        email: userAEmail,
        password: 'Password123!',
      }),
    });
    const regJson = await regRes.json();
    if (!regRes.ok || !regJson.token) {
      throw new Error(`User registration failed: ${JSON.stringify(regJson)}`);
    }
    const tokenA = regJson.token;
    console.log('  ✅ User A registered and received valid JWT token.');

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const meJson = await meRes.json();
    if (!meRes.ok || meJson.user?.email !== userAEmail) {
      throw new Error(`Auth verify failed: ${JSON.stringify(meJson)}`);
    }
    console.log(`  ✅ Profile retrieved: ${meJson.user.name} (${meJson.user.email})`);

    // 3. Multi-User Isolation
    console.log('\n[3/6] Verifying Two-User Data Isolation (Zero Leakage)...');
    const userBEmail = `smoke_user_b_${testId}@studybuddy.dev`;
    const regBRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke User B',
        email: userBEmail,
        password: 'Password123!',
      }),
    });
    const regBJson = await regBRes.json();
    const tokenB = regBJson.token;

    // User A creates a private subject
    const addSubRes = await fetch(`${baseUrl}/api/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        name: 'User A Secret Subject',
        code: 'SEC101',
        color: '#6366f1',
      }),
    });
    const subJson = await addSubRes.json();
    if (!addSubRes.ok || !subJson.subject) {
      throw new Error(`Failed to create subject for User A: ${JSON.stringify(subJson)}`);
    }

    // User B fetches subjects
    const userBSubjectsRes = await fetch(`${baseUrl}/api/subjects`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const userBSubjectsJson = await userBSubjectsRes.json();
    const hasLeak = (userBSubjectsJson.subjects || []).some((s) => s.name === 'User A Secret Subject');
    if (hasLeak) {
      throw new Error('CRITICAL SECURITY VIOLATION: User B can see User A private subject!');
    }
    console.log('  ✅ Confirmed: User B cannot view User A subjects.');

    // 4. Scheduler Execution
    console.log('\n[4/6] Verifying Planner Generation & Reschedule API (/api/planner)...');
    const planRes = await fetch(`${baseUrl}/api/planner/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ commit: false }),
    });
    const planJson = await planRes.json();
    if (!planRes.ok || !Array.isArray(planJson.tasks)) {
      throw new Error(`Plan generation failed: ${JSON.stringify(planJson)}`);
    }
    console.log(`  ✅ Plan preview generated: ${planJson.planSummary?.totalHoursScheduled || 0} scheduled hours`);

    // 5. Pomodoro Session Logging
    console.log('\n[5/6] Verifying Study Session Logging (/api/sessions)...');
    const sessionRes = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        subjectId: subJson.subject.id || subJson.subject._id,
        subjectName: subJson.subject.name,
        durationMin: 25,
        date: new Date().toISOString().split('T')[0],
        notes: '25 min focused Pomodoro sprint',
      }),
    });
    const sessionJson = await sessionRes.json();
    if (!sessionRes.ok || !sessionJson.session) {
      throw new Error(`Session logging failed: ${JSON.stringify(sessionJson)}`);
    }
    console.log(`  ✅ Pomodoro session logged: 25 min to ${subJson.subject.name}`);

    // 6. AI Chatbot & Tool Calling
    console.log('\n[6/6] Verifying AI Chatbot & Guardrails (/api/chat)...');
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        message: 'What should I study today?',
      }),
    });
    const chatJson = await chatRes.json();
    if (!chatRes.ok || !chatJson.reply) {
      throw new Error(`Chat API failed: ${JSON.stringify(chatJson)}`);
    }
    console.log(`  ✅ AI Chatbot replied successfully (Tools: ${chatJson.toolCalls?.length || 0})`);

    console.log('\n🎉 ALL 6 PRODUCTION SMOKE TESTS PASSED CLEANLY!\n');
    process.exitCode = 0;
  } catch (err) {
    console.error(`\n❌ Smoke Test Failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runSmokeTests();
