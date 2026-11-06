const BASE_URL = process.env.API_URL || 'http://127.0.0.1:5001/api';

async function runMemberBTests() {
  console.log('🧪 =========================================================');
  console.log('   MEMBER B VERIFICATION SUITE: Backend & Scheduler Engine   ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  let authToken = '';

  // 1. Health check
  await assertTest('Health check reports Member 2 / B and Cron active', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'online' || data.modules.member2_backend_scheduler !== 'ACTIVE') {
      throw new Error(`Unexpected health status: ${JSON.stringify(data)}`);
    }
  });

  // 2. Auth: Register
  const testEmail = `test_student_${Date.now()}@test.com`;
  await assertTest('Auth: Register new student account (POST /api/auth/register)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: testEmail,
        password: 'securePassword123',
        dailyHours: 5,
      }),
    });
    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error(data.error || 'Failed to register');
    }
    authToken = data.token;
  });

  // 3. Auth: Login
  await assertTest('Auth: Login with credentials (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.token || data.user.email !== testEmail) {
      throw new Error(data.error || 'Failed to login');
    }
  });

  // 4. Auth: Profile (GET /api/auth/me)
  await assertTest('Auth: Retrieve Profile (GET /api/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.success || !data.user) {
      throw new Error('Profile fetch failed');
    }
  });

  // 5. Subjects & Topics: Fetch (GET /api/subjects)
  await assertTest('Subjects: Fetch Subjects & Topics (GET /api/subjects)', async () => {
    const res = await fetch(`${BASE_URL}/subjects`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.subjects) || data.subjects.length === 0) {
      throw new Error('Failed to fetch subjects');
    }
  });

  // 6. Subjects: Create Subject (POST /api/subjects)
  let createdSubjectId = '';
  await assertTest('Subjects: Create Subject (POST /api/subjects)', async () => {
    const res = await fetch(`${BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Computer Networks',
        code: 'CS305',
        color: '#06b6d4',
        examDate: '2026-11-20',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.subject) throw new Error('Create subject failed');
    createdSubjectId = data.subject.id || data.subject._id;
  });

  // 7. Topics: Add Topic (POST /api/subjects/:id/topics)
  await assertTest('Topics: Add Topic to Subject (POST /api/subjects/:id/topics)', async () => {
    const res = await fetch(`${BASE_URL}/subjects/${createdSubjectId}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'TCP 3-Way Handshake & Flow Control',
        difficulty: 2,
        estimatedHours: 3,
      }),
    });
    const data = await res.json();
    if (!data.success || !data.topic) throw new Error('Add topic failed');
  });

  // 8. Tasks: Fetch Tasks (GET /api/tasks)
  await assertTest('Tasks: Fetch Tasks with filters (GET /api/tasks)', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.tasks)) throw new Error('Fetch tasks failed');
  });

  // 9. Tasks: Create Task (POST /api/tasks)
  let createdTaskId = '';
  await assertTest('Tasks: Create Task (POST /api/tasks)', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Review TCP congestion control algorithms',
        subjectName: 'Computer Networks',
        durationHours: 2,
        priority: 'high',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.task) throw new Error('Create task failed');
    createdTaskId = data.task.id || data.task._id;
  });

  // 10. Tasks: Complete Task (PATCH /api/tasks/:id/complete)
  await assertTest('Tasks: Toggle Complete (PATCH /api/tasks/:id/complete)', async () => {
    const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.success || data.task.completed !== true) throw new Error('Toggle complete failed');
  });

  // 11. Auto-Scheduler Algorithm (POST /api/planner/generate)
  await assertTest('Scheduler: Generate Auto-Schedule (POST /api/planner/generate)', async () => {
    const res = await fetch(`${BASE_URL}/planner/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ dailyHours: 4 }),
    });
    const data = await res.json();
    if (!data.success || !data.tasks || data.tasks.length === 0) {
      throw new Error('Scheduler failed to generate plan');
    }
    // Verify revision tasks exist before exams
    const hasRevision = data.tasks.some(t => t.type === 'revision');
    if (!hasRevision) throw new Error('Scheduler did not reserve revision tasks before exams');
  });

  // 12. Overdue Rescheduling (POST /api/planner/reschedule-missed)
  await assertTest('Scheduler: Reschedule Overdue (POST /api/planner/reschedule-missed)', async () => {
    const res = await fetch(`${BASE_URL}/planner/reschedule-missed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error('Reschedule missed failed');
  });

  // 13. Sessions: Log Pomodoro session (POST /api/sessions)
  await assertTest('Sessions: Log Pomodoro focus session (POST /api/sessions)', async () => {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        durationMin: 25,
        subjectName: 'Computer Networks',
        notes: '25 min focused block on TCP sliding windows',
      }),
    });
    const data = await res.json();
    if (!data.success || !data.session) throw new Error('Create session failed');
  });

  // 14. Analytics: Fetch Summary (GET /api/analytics/summary)
  await assertTest('Analytics: Summary statistics (GET /api/analytics/summary)', async () => {
    const res = await fetch(`${BASE_URL}/analytics/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.success || !data.summary || data.summary.totalStudyHoursThisWeek === undefined) {
      throw new Error('Analytics summary invalid');
    }
  });

  // 15. Reminders: Schedule & Fetch (POST & GET /api/reminders)
  let remId = '';
  await assertTest('Reminders: Schedule and Fetch reminders (POST & GET /api/reminders)', async () => {
    const createRes = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Evening Focus Block: TCP Review',
        remindAt: new Date(Date.now() + 1800000).toISOString(),
        email: testEmail,
      }),
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.reminder) throw new Error('Create reminder failed');
    remId = createData.reminder.id || createData.reminder._id;

    const listRes = await fetch(`${BASE_URL}/reminders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    if (!listData.success || listData.reminders.length === 0) throw new Error('List reminders failed');
  });

  console.log(`\n============================================================`);
  console.log(`🎯 MEMBER B TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`============================================================\n`);
  if (failed > 0) process.exit(1);
}

runMemberBTests();
