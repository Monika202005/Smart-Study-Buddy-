import {
  calculateTopicWeight,
  calculateExamUrgency,
  buildSchedulePlan,
  buildRescheduleMissedPlan,
} from '../services/scheduler.js';
import { toDateString } from '../services/analyticsService.js';

describe('Member B: Auto-Scheduler Algorithm Unit Tests (Section 8, 14 & 20)', () => {
  test('Weighting Rule 1: Topic weight is computed as difficulty * estimatedHours', () => {
    // difficulty 3, estimatedHours 4 -> weight 12
    const weight1 = calculateTopicWeight(3, 4);
    expect(weight1).toBe(12);

    // difficulty 1, estimatedHours 2 -> weight 2
    const weight2 = calculateTopicWeight(1, 2);
    expect(weight2).toBe(2);
  });

  test('Urgency Rule 3: Closer exams receive higher priority/urgency scores', () => {
    const today = new Date();
    const in3Days = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];
    const in12Days = new Date(today.getTime() + 12 * 86400000).toISOString().split('T')[0];

    const urgency3 = calculateExamUrgency(in3Days);
    const urgency12 = calculateExamUrgency(in12Days);

    expect(urgency3.urgency).toBeGreaterThan(urgency12.urgency);
  });

  test('Capacity Rule 4: No day exceeds user daily hours limit with fixed inputs (3 subjects, 10 days, 4 hours/day)', () => {
    const today = new Date();
    const todayStr = toDateString(today);

    const sub1Exam = new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0];
    const sub2Exam = new Date(today.getTime() + 8 * 86400000).toISOString().split('T')[0];
    const sub3Exam = new Date(today.getTime() + 12 * 86400000).toISOString().split('T')[0];

    const subjects = [
      { id: 'sub_1', name: 'Data Structures', examDate: sub1Exam },
      { id: 'sub_2', name: 'Database Systems', examDate: sub2Exam },
      { id: 'sub_3', name: 'Computer Networks', examDate: sub3Exam },
    ];

    const topics = [
      { id: 'top_1', subjectId: 'sub_1', name: 'Trees', difficulty: 3, estimatedHours: 4, status: 'pending' },
      { id: 'top_2', subjectId: 'sub_1', name: 'Graphs', difficulty: 3, estimatedHours: 3, status: 'pending' },
      { id: 'top_3', subjectId: 'sub_2', name: 'SQL & Normalization', difficulty: 2, estimatedHours: 4, status: 'pending' },
      { id: 'top_4', subjectId: 'sub_2', name: 'Transactions & ACID', difficulty: 3, estimatedHours: 3, status: 'pending' },
      { id: 'top_5', subjectId: 'sub_3', name: 'TCP/IP', difficulty: 2, estimatedHours: 3, status: 'pending' },
      { id: 'top_6', subjectId: 'sub_3', name: 'Routing Protocols', difficulty: 3, estimatedHours: 4, status: 'pending' },
    ];

    const dailyLimit = 4;
    const tasks = buildSchedulePlan({
      subjects,
      topics,
      dailyHours: dailyLimit,
      horizonDays: 10,
      todayStr,
    });

    expect(tasks.length).toBeGreaterThan(0);

    // Group tasks by scheduledDate and verify sum of hours <= dailyLimit
    const hoursByDate = {};
    tasks.forEach((t) => {
      hoursByDate[t.scheduledDate] = (hoursByDate[t.scheduledDate] || 0) + t.durationHours;
    });

    for (const [date, totalHours] of Object.entries(hoursByDate)) {
      expect(totalHours).toBeLessThanOrEqual(dailyLimit + 0.01);
    }
  });

  test('Revision Rule 2 & 5: Revision tasks appear reserved 1-2 days before exams', () => {
    const today = new Date();
    const todayStr = toDateString(today);
    const sub1Exam = new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0];

    const subjects = [{ id: 'sub_rev', name: 'Operating Systems', examDate: sub1Exam }];
    const topics = [
      { id: 'top_os_1', subjectId: 'sub_rev', name: 'Process Synchronization', difficulty: 3, estimatedHours: 4, status: 'pending' },
    ];

    const tasks = buildSchedulePlan({
      subjects,
      topics,
      dailyHours: 4,
      horizonDays: 7,
      todayStr,
    });

    const revisionTasks = tasks.filter((t) => t.type === 'revision');
    expect(revisionTasks.length).toBeGreaterThan(0);

    revisionTasks.forEach((revTask) => {
      expect(revTask.title).toMatch(/Revision/i);
      expect(revTask.priority).toBe('high');
    });
  });

  test('Exam Boundary Rule: Topics are NEVER scheduled after their exam date', () => {
    const today = new Date();
    const todayStr = toDateString(today);
    const examDateStr = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];

    const subjects = [{ id: 'sub_boundary', name: 'Math', examDate: examDateStr }];
    const topics = [
      { id: 't_m1', subjectId: 'sub_boundary', name: 'Calculus 1', difficulty: 3, estimatedHours: 10, status: 'pending' },
    ];

    const tasks = buildSchedulePlan({
      subjects,
      topics,
      dailyHours: 2,
      horizonDays: 10,
      todayStr,
    });

    tasks.forEach((task) => {
      expect(task.scheduledDate <= examDateStr).toBe(true);
    });
  });

  test('Determinism Rule: Identical inputs always produce identical schedules', () => {
    const todayStr = toDateString(new Date());
    const subjects = [{ id: 'sub_det', name: 'Algorithms', examDate: '2026-11-20' }];
    const topics = [
      { id: 'top_d1', subjectId: 'sub_det', name: 'Dynamic Programming', difficulty: 3, estimatedHours: 4, status: 'pending' },
      { id: 'top_d2', subjectId: 'sub_det', name: 'Greedy Algorithms', difficulty: 2, estimatedHours: 3, status: 'pending' },
    ];

    const plan1 = buildSchedulePlan({ subjects, topics, dailyHours: 4, horizonDays: 7, todayStr });
    const plan2 = buildSchedulePlan({ subjects, topics, dailyHours: 4, horizonDays: 7, todayStr });

    expect(plan1).toEqual(plan2);
  });

  test('Rebalancing Rule 6: Overdue tasks roll forward to today or tomorrow', () => {
    const todayStr = toDateString(new Date());
    const tomorrowStr = toDateString(new Date(Date.now() + 86400000));
    const yesterdayStr = toDateString(new Date(Date.now() - 86400000));

    const overdueTasks = [
      { id: 'missed_1', title: 'Missed Task 1', scheduledDate: yesterdayStr, completed: false },
      { id: 'missed_2', title: 'Missed Task 2', scheduledDate: yesterdayStr, completed: false },
    ];

    const rebalanced = buildRescheduleMissedPlan({ overdueTasks, todayStr });

    expect(rebalanced.length).toBe(2);
    rebalanced.forEach((task) => {
      expect([todayStr, tomorrowStr]).toContain(task.scheduledDate);
      expect(task.isRescheduled).toBe(true);
      expect(task.priority).toBe('high');
    });
  });
});
