import TaskModel from '../models/Task.js';
import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import UserModel from '../models/User.js';
import {
  calculateTopicWeight,
  calculateExamUrgency,
  buildSchedulePlan,
  buildRescheduleMissedPlan,
} from './scheduler.js';
import { toDateString } from './analyticsService.js';

export {
  calculateTopicWeight,
  calculateExamUrgency,
  buildSchedulePlan,
  buildRescheduleMissedPlan,
};

/**
 * Generate Auto-Schedule Plan for a user
 */
export async function generateAutoSchedule(userId, customDailyHours = null) {
  const user = userId ? await UserModel.findById(userId).lean() : null;
  const dailyHours = customDailyHours
    ? Number(customDailyHours)
    : user?.dailyHours || 4;

  const [dbSubjects, dbTopics] = await Promise.all([
    SubjectModel.find(userId ? { userId } : {}).lean(),
    TopicModel.find(userId ? { userId } : {}).lean(),
  ]);

  const subjects = dbSubjects.map((s) => ({
    ...s,
    id: s._id.toString(),
    _id: s._id.toString(),
  }));

  const topics = dbTopics.map((t) => ({
    ...t,
    id: t._id.toString(),
    _id: t._id.toString(),
  }));

  const todayStr = toDateString(new Date());

  const generatedTasks = buildSchedulePlan({
    subjects,
    topics,
    dailyHours,
    horizonDays: 14,
    todayStr,
  });

  return {
    success: true,
    message: `Generated algorithmic study plan adhering to ${dailyHours}h daily limit.`,
    dailyHours,
    tasksCount: generatedTasks.length,
    planSummary: {
      totalHoursScheduled: Number(
        generatedTasks.reduce((sum, t) => sum + (t.durationHours || 0), 0).toFixed(1)
      ),
      revisionTasksCount: generatedTasks.filter((t) => t.type === 'revision').length,
      studyTasksCount: generatedTasks.filter((t) => t.type === 'study').length,
    },
    tasks: generatedTasks,
  };
}

/**
 * Reschedule overdue tasks
 */
export async function rescheduleMissedTasksService(userId) {
  const todayStr = toDateString(new Date());
  const overdueTasks = await TaskModel.find({
    ...(userId ? { userId } : {}),
    completed: false,
    scheduledDate: { $lt: todayStr },
  }).lean();

  const formattedOverdue = overdueTasks.map((t) => ({
    ...t,
    id: t._id.toString(),
    _id: t._id.toString(),
  }));

  const rebalanced = buildRescheduleMissedPlan({
    overdueTasks: formattedOverdue,
    todayStr,
  });

  for (const t of rebalanced) {
    if (t.id) {
      await TaskModel.findByIdAndUpdate(t.id, {
        scheduledDate: t.scheduledDate,
        dueDate: t.dueDate,
        isRescheduled: true,
        priority: t.priority,
      });
    }
  }

  return {
    success: true,
    rescheduledCount: rebalanced.length,
    tasks: rebalanced,
    message: `Successfully rebalanced ${rebalanced.length} overdue task(s).`,
  };
}
