import { executeTool } from '../services/chatbotTools.js';
import { validateToolArguments, validateISODate } from '../services/toolValidator.js';
import { getTodayTasks, getMissedTasks, addTask, rescheduleOverdue } from '../services/plannerRepository.js';
import FlashcardQuizModel from '../models/FlashcardQuiz.js';

describe('Tool Validation & Execution (TASK 2 & TASK 3)', () => {
  describe('Schema & Date Validation', () => {
    it('validates ISO date format and calendar reality', () => {
      expect(validateISODate('2026-11-06')).toBe(true);
      expect(validateISODate('2026-02-28')).toBe(true);
      // Invalid date (February 31)
      expect(validateISODate('2026-02-31')).toBe(false);
      // Malformed date
      expect(validateISODate('not-a-date')).toBe(false);
      expect(validateISODate('11-06-2026')).toBe(false);
      // Date outside reasonable bounds (<2020 or >2035)
      expect(validateISODate('1999-01-01')).toBe(false);
      expect(validateISODate('2050-01-01')).toBe(false);
    });

    it('rejects create_task with missing or empty title', () => {
      const res1 = validateToolArguments('create_task', {});
      expect(res1.valid).toBe(false);
      expect(res1.details).toContain('Field "title" is required and must be a string.');

      const res2 = validateToolArguments('create_task', { title: '   ' });
      expect(res2.valid).toBe(false);
      expect(res2.details).toContain('Field "title" cannot be empty.');
    });

    it('rejects create_task with title exceeding 150 chars', () => {
      const longTitle = 'A'.repeat(151);
      const res = validateToolArguments('create_task', { title: longTitle });
      expect(res.valid).toBe(false);
      expect(res.details).toContain('Field "title" exceeds maximum limit of 150 characters.');
    });

    it('rejects create_task with invalid priority enum', () => {
      const res = validateToolArguments('create_task', { title: 'Study Math', priority: 'urgent' });
      expect(res.valid).toBe(false);
      expect(res.details).toContain('Field "priority" must be one of: "high", "medium", "low".');
    });

    it('rejects create_task with invalid durationHours', () => {
      const res = validateToolArguments('create_task', { title: 'Study Math', durationHours: 12 });
      expect(res.valid).toBe(false);
      expect(res.details).toContain('Field "durationHours" must be between 0.5 and 8.0 hours.');
    });

    it('rejects create_task with invalid dueDate format', () => {
      const res = validateToolArguments('create_task', { title: 'Study Math', dueDate: 'yesterday' });
      expect(res.valid).toBe(false);
      expect(res.details[0]).toMatch(/must be a valid ISO date string/);
    });

    it('accepts valid create_task arguments', () => {
      const res = validateToolArguments('create_task', {
        title: 'Review AVL rotations',
        subjectName: 'Data Structures',
        durationHours: 2,
        priority: 'high',
        dueDate: '2026-11-10',
      });
      expect(res.valid).toBe(true);
      expect(res.data.title).toBe('Review AVL rotations');
      expect(res.data.durationHours).toBe(2);
      expect(res.data.priority).toBe('high');
      expect(res.data.dueDate).toBe('2026-11-10');
    });

    it('caps generate_flashcards count at 10', () => {
      const res = validateToolArguments('generate_flashcards', {
        topic: 'B+ Tree Indexing',
        count: 50,
      });
      expect(res.valid).toBe(true);
      expect(res.data.count).toBe(10);
    });

    it('rejects unknown tool name', () => {
      const res = validateToolArguments('delete_database', {});
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/Unknown tool/);
    });
  });

  describe('Tool Execution & userId Isolation', () => {
    it('executes create_task and binds to specified userId', async () => {
      const testUser = 'test_student_user_99';
      const result = await executeTool(
        'create_task',
        {
          title: 'Implement AVL Tree rebalancing',
          durationHours: 2,
          priority: 'high',
        },
        testUser
      );

      expect(result.success).toBe(true);
      expect(result.task).toBeDefined();
      expect(result.task.title).toBe('Implement AVL Tree rebalancing');
      expect(result.task.userId).toBe(testUser);
    });

    it('filters get_today_plan strictly by userId', async () => {
      const userA = 'user_alpha';
      const userB = 'user_beta';

      // Add a task for userA
      await addTask(userA, {
        title: 'User A Special Task',
        scheduledDate: new Date().toISOString().split('T')[0],
      });

      const planA = await executeTool('get_today_plan', {}, userA);
      const planB = await executeTool('get_today_plan', {}, userB);

      const hasTaskInA = planA.todayTasks.some((t) => t.title === 'User A Special Task');
      const hasTaskInB = planB.todayTasks.some((t) => t.title === 'User A Special Task');

      expect(hasTaskInA).toBe(true);
      expect(hasTaskInB).toBe(false);
    });

    it('executes reschedule_missed for user overdue tasks', async () => {
      const testUser = 'user_reschedule_test';
      const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await addTask(testUser, {
        title: 'Overdue Task 1',
        scheduledDate: yesterdayStr,
        dueDate: yesterdayStr,
      });

      const res = await executeTool('reschedule_missed', {}, testUser);
      expect(res.success).toBe(true);
      expect(res.rescheduledCount).toBeGreaterThanOrEqual(1);
    });

    it('generates flashcards, validates schema, caps count, and saves to store for user', async () => {
      const testUser = 'user_flashcard_test';
      const initialCount = await FlashcardQuizModel.countDocuments({ userId: testUser });

      const result = await executeTool(
        'generate_flashcards',
        { topic: 'B+ Tree Indexing', subject: 'DBMS', count: 2 },
        testUser
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.flashcards.length).toBe(2);
      expect(result.flashcards[0].userId).toBe(testUser);
      expect(result.flashcards[0].options.length).toBeGreaterThanOrEqual(2);

      const updatedCount = await FlashcardQuizModel.countDocuments({ userId: testUser });
      expect(updatedCount).toBe(initialCount + 2);
    });
  });
});

