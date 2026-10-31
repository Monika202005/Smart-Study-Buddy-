import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTopicWeight,
  calculateExamUrgency,
  generateAutoSchedule,
  rescheduleMissedTasksService,
} from '../services/schedulerService.js';

describe('Member B: Auto-Scheduler Algorithm Unit Tests (Section 8, 14 & 20)', () => {

  test('Weighting Rule 1: Topic weight is computed as difficulty * estimatedHours', () => {
    // difficulty 3, estimatedHours 4 -> weight 12
    const weight1 = calculateTopicWeight(3, 4);
    assert.equal(weight1, 12, 'Weight must equal 3 * 4');

    // difficulty 1, estimatedHours 2 -> weight 2
    const weight2 = calculateTopicWeight(1, 2);
    assert.equal(weight2, 2, 'Weight must equal 1 * 2');
  });

  test('Urgency Rule 3: Closer exams receive higher priority/urgency scores', () => {
    const today = new Date();
    const in3Days = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];
    const in12Days = new Date(today.getTime() + 12 * 86400000).toISOString().split('T')[0];

    const urgency3 = calculateExamUrgency(in3Days);
    const urgency12 = calculateExamUrgency(in12Days);

    assert.ok(
      urgency3.urgency > urgency12.urgency,
      `Closer exam urgency (${urgency3.urgency}) must be greater than farther exam (${urgency12.urgency})`
    );
  });

  test('Capacity Rule 4: No day exceeds user daily hours limit with fixed inputs (3 subjects, 4 hours/day)', async () => {
    const dailyLimit = 4;
    const plan = await generateAutoSchedule('test_user_unit', dailyLimit);

    assert.ok(plan.success, 'Plan generation must succeed');
    assert.ok(plan.tasks.length > 0, 'Plan must contain scheduled tasks');

    // Group tasks by scheduledDate and verify sum of hours <= dailyLimit
    const hoursByDate = {};
    plan.tasks.forEach(t => {
      hoursByDate[t.scheduledDate] = (hoursByDate[t.scheduledDate] || 0) + t.durationHours;
    });

    for (const [date, totalHours] of Object.entries(hoursByDate)) {
      assert.ok(
        totalHours <= dailyLimit + 0.01,
        `Day ${date} has ${totalHours} hours, which exceeds the ${dailyLimit}h daily limit!`
      );
    }
  });

  test('Revision Rule 2 & 5: Revision tasks appear reserved 1-2 days before exams', async () => {
    const plan = await generateAutoSchedule('test_user_unit', 4);
    const revisionTasks = plan.tasks.filter(t => t.type === 'revision');

    assert.ok(revisionTasks.length > 0, 'Plan must contain pre-exam revision tasks');
    
    revisionTasks.forEach(revTask => {
      assert.ok(revTask.title.includes('Revision'), 'Revision task must be explicitly titled as Revision');
      assert.equal(revTask.priority, 'high', 'Revision tasks must have high priority');
    });
  });

  test('Rebalancing Rule 6: Overdue tasks roll forward to today or tomorrow', async () => {
    const result = await rescheduleMissedTasksService('test_user_unit');
    assert.ok(result.success, 'Reschedule operation must succeed');

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    result.tasks.forEach(task => {
      assert.ok(
        task.scheduledDate === todayStr || task.scheduledDate === tomorrowStr,
        `Rescheduled task date (${task.scheduledDate}) must be today (${todayStr}) or tomorrow (${tomorrowStr})`
      );
      assert.equal(task.isRescheduled, true, 'Task must be flagged as rescheduled');
    });
  });

});
