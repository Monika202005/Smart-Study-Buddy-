import { generateAutoSchedule, rescheduleMissedTasksService } from '../services/schedulerService.js';

/**
 * POST /api/planner/generate
 * Executes the auto-scheduling algorithm (Member B)
 */
export async function handleGeneratePlan(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { dailyHours } = req.body || {};

    const planResult = await generateAutoSchedule(userId, dailyHours);
    return res.status(200).json(planResult);
  } catch (error) {
    console.error('Planner generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate study plan.' });
  }
}

/**
 * POST /api/planner/reschedule-missed
 * Rebalances overdue tasks (Member B)
 */
export async function handleRescheduleMissed(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const result = await rescheduleMissedTasksService(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Reschedule missed error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reschedule missed tasks.' });
  }
}
