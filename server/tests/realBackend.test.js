import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import UserModel from '../models/User.js';
import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import TaskModel from '../models/Task.js';
import StudySessionModel from '../models/StudySession.js';
import { calculateStreak, calculateCalendarDaysLeft } from '../services/analyticsService.js';
import { createTestUser } from './testAuthHelper.js';

describe('Real Backend Multi-User Integration Tests', () => {
  describe('Authentication & User Lifecycle (/api/auth & /api/user)', () => {
    it('registers a new student with valid credentials and sets default values', async () => {
      const email = `newstudent_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email,
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        name: 'Jane Doe',
        email,
        dailyHours: 2,
      });

      // Verify password is not in response
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('rejects registration with duplicate email (409 Conflict)', async () => {
      const email = `duplicate_${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 1', email, password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 2', email, password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already registered/i);
    });

    it('rejects registration with invalid email or short password (< 8 chars)', async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'not-an-email', password: '123' });

      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'valid@example.com', password: 'short' });

      expect(res2.status).toBe(400);
      expect(res2.body.error).toMatch(/at least 8 characters/i);
    });

    it('logs in with correct credentials and returns JWT token', async () => {
      const email = `login_${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Login User', email, password: 'mypassword123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'mypassword123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(email);
    });

    it('rejects login with wrong password (401)', async () => {
      const email = `wrongpass_${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Wrong Pass', email, password: 'mypassword123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Invalid email or password/i);
    });

    it('rejects protected routes when token is missing (401)', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Access denied/i);
    });

    it('rejects protected routes when token is expired or invalid (401)', async () => {
      const expiredToken = jwt.sign(
        { userId: 'fake_id' },
        process.env.JWT_SECRET || 'test_jwt_secret_studybuddy_super_secure_key_12345',
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it('fetches current user profile via /api/auth/me', async () => {
      const { authHeader, email, name } = await createTestUser();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.name).toBe(name);
    });

    it('updates user profile via PUT /api/user/profile', async () => {
      const { authHeader, userId } = await createTestUser();
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', authHeader)
        .send({ name: 'Updated Name', dailyHours: 5, theme: 'light' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Updated Name');
      expect(res.body.user.dailyHours).toBe(5);
      expect(res.body.user.theme).toBe('light');

      const dbUser = await UserModel.findById(userId);
      expect(dbUser.name).toBe('Updated Name');
      expect(dbUser.dailyHours).toBe(5);
    });
  });

  describe('Two-User Data Isolation (Zero Cross-Tenant Leaks)', () => {
    let userA, userB;

    beforeEach(async () => {
      userA = await createTestUser({ name: 'Student A' });
      userB = await createTestUser({ name: 'Student B' });
    });

    it('isolates subjects between User A and User B', async () => {
      // User A creates subject
      const createRes = await request(app)
        .post('/api/subjects')
        .set('Authorization', userA.authHeader)
        .send({ name: 'User A Subject', code: 'UAS101', color: '#10b981' });

      expect(createRes.status).toBe(201);
      const subjectAId = createRes.body.subject._id || createRes.body.subject.id;

      // User B lists subjects -> must be EMPTY
      const listResB = await request(app)
        .get('/api/subjects')
        .set('Authorization', userB.authHeader);

      expect(listResB.status).toBe(200);
      expect(listResB.body.subjects).toHaveLength(0);

      // User B attempts to access User A's subject directly -> 404
      const getResB = await request(app)
        .get(`/api/subjects/${subjectAId}`)
        .set('Authorization', userB.authHeader);

      expect(getResB.status).toBe(404);

      // User B attempts to delete User A's subject -> 404
      const deleteResB = await request(app)
        .delete(`/api/subjects/${subjectAId}`)
        .set('Authorization', userB.authHeader);

      expect(deleteResB.status).toBe(404);

      // User A still has their subject
      const listResA = await request(app)
        .get('/api/subjects')
        .set('Authorization', userA.authHeader);

      expect(listResA.status).toBe(200);
      expect(listResA.body.subjects).toHaveLength(1);
    });

    it('isolates tasks between User A and User B', async () => {
      const taskResA = await request(app)
        .post('/api/tasks')
        .set('Authorization', userA.authHeader)
        .send({
          title: 'Secret Task for User A',
          durationHours: 2,
          priority: 'high',
        });

      expect(taskResA.status).toBe(201);
      const taskAId = taskResA.body.task._id || taskResA.body.task.id;

      // User B lists tasks -> must NOT see User A's task
      const listB = await request(app)
        .get('/api/tasks')
        .set('Authorization', userB.authHeader);

      expect(listB.status).toBe(200);
      expect(listB.body.tasks).toHaveLength(0);

      // User B attempts to toggle completion of User A's task -> 404
      const toggleB = await request(app)
        .put(`/api/tasks/${taskAId}/toggle`)
        .set('Authorization', userB.authHeader);

      expect(toggleB.status).toBe(404);
    });

    it('isolates analytics and streaks between User A and User B', async () => {
      // User A logs a session
      await request(app)
        .post('/api/sessions')
        .set('Authorization', userA.authHeader)
        .send({
          durationMin: 60,
          date: new Date().toISOString().split('T')[0],
          notes: 'User A Study Session',
        });

      // User A analytics
      const analyticsA = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', userA.authHeader);

      expect(analyticsA.status).toBe(200);
      expect(analyticsA.body.summary.minutesToday).toBe(60);

      // User B analytics must be 0
      const analyticsB = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', userB.authHeader);

      expect(analyticsB.status).toBe(200);
      expect(analyticsB.body.summary.minutesToday).toBe(0);
      expect(analyticsB.body.summary.todayCompletedTasks).toBe(0);
    });
  });

  describe('Pure Analytics Service Unit Verifications', () => {
    it('calculates streak accurately based on consecutive days', () => {
      const today = new Date();
      const d = (offsetDays) => {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - offsetDays);
        return dt.toISOString().split('T')[0];
      };

      // 3 consecutive days ending today
      const dates3Days = [d(0), d(1), d(2)];
      expect(calculateStreak(dates3Days, today)).toBe(3);

      // 2 consecutive days ending yesterday (active streak)
      const datesEndingYesterday = [d(1), d(2)];
      expect(calculateStreak(datesEndingYesterday, today)).toBe(2);

      // Streak broken (active 3 days ago, but missed yesterday and today)
      const datesBroken = [d(3), d(4)];
      expect(calculateStreak(datesBroken, today)).toBe(0);

      // Empty activity
      expect(calculateStreak([], today)).toBe(0);
    });

    it('calculates calendar days left without UTC drift', () => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
      expect(calculateCalendarDaysLeft(tomorrow)).toBe(1);

      const in5Days = new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0];
      expect(calculateCalendarDaysLeft(in5Days)).toBe(5);
    });
  });

  describe('Planner Generation & Reschedule API (/api/planner)', () => {
    let student;

    beforeEach(async () => {
      student = await createTestUser({ dailyHours: 3 });

      // Add a subject with exam in 6 days
      const examDate = new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];
      const subRes = await request(app)
        .post('/api/subjects')
        .set('Authorization', student.authHeader)
        .send({ name: 'Algorithms', code: 'ALG101', examDate });

      const subId = subRes.body.subject._id || subRes.body.subject.id;

      // Add topics
      await request(app)
        .post('/api/topics')
        .set('Authorization', student.authHeader)
        .send({ subjectId: subId, name: 'Divide & Conquer', difficulty: 2, estimatedHours: 3 });

      await request(app)
        .post('/api/topics')
        .set('Authorization', student.authHeader)
        .send({ subjectId: subId, name: 'Dynamic Programming', difficulty: 3, estimatedHours: 4 });
    });

    it('generates plan preview when commit: false (does NOT persist to TaskModel)', async () => {
      const res = await request(app)
        .post('/api/planner/generate')
        .set('Authorization', student.authHeader)
        .send({ commit: false, horizonDays: 7 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.committed).toBe(false);
      expect(res.body.tasks.length).toBeGreaterThan(0);

      // Verify no tasks were written to DB
      const dbTaskCount = await TaskModel.countDocuments({ userId: student.userId });
      expect(dbTaskCount).toBe(0);
    });

    it('persists plan to DB when commit: true', async () => {
      const res = await request(app)
        .post('/api/planner/generate')
        .set('Authorization', student.authHeader)
        .send({ commit: true, horizonDays: 7 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.committed).toBe(true);

      const dbTasks = await TaskModel.find({ userId: student.userId });
      expect(dbTasks.length).toBe(res.body.tasksCount);
      expect(dbTasks.length).toBeGreaterThan(0);
    });

    it('supports reschedule missed preview (commit: false) and commit (commit: true)', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Insert an overdue task directly into DB
      await TaskModel.create({
        userId: student.userId,
        title: 'Overdue Assignment',
        scheduledDate: yesterday,
        dueDate: yesterday,
        completed: false,
      });

      // Preview reschedule
      const previewRes = await request(app)
        .post('/api/planner/reschedule-missed')
        .set('Authorization', student.authHeader)
        .send({ commit: false });

      expect(previewRes.status).toBe(200);
      expect(previewRes.body.committed).toBe(false);
      expect(previewRes.body.rescheduledCount).toBe(1);

      // Verify task still has yesterday date in DB
      const overdueCheck = await TaskModel.findOne({ userId: student.userId });
      expect(overdueCheck.scheduledDate).toBe(yesterday);

      // Commit reschedule
      const commitRes = await request(app)
        .post('/api/planner/reschedule-missed')
        .set('Authorization', student.authHeader)
        .send({ commit: true });

      expect(commitRes.status).toBe(200);
      expect(commitRes.body.committed).toBe(true);

      const updatedCheck = await TaskModel.findOne({ userId: student.userId });
      const todayStr = new Date().toISOString().split('T')[0];
      expect(updatedCheck.scheduledDate).toBe(todayStr);
      expect(updatedCheck.isRescheduled).toBe(true);
    });
  });
});

