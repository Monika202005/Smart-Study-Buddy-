import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import TaskModel from '../models/Task.js';
import UserModel from '../models/User.js';
import { buildSchedulePlan, buildRescheduleMissedPlan } from '../services/scheduler.js';
import { toDateString } from '../services/analyticsService.js';

/**
 * POST /api/planner/generate
 * Supports { commit: false } (preview) and { commit: true } (save)
 */
export async function handleGeneratePlan(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { commit = false, dailyHours: requestedDailyHours, horizonDays = 14 } = req.body || {};

    const [user, dbSubjects, dbTopics] = await Promise.all([
      UserModel.findById(userId).lean(),
      SubjectModel.find({ userId }).sort({ examDate: 1 }).lean(),
      TopicModel.find({ userId }).lean(),
    ]);

    const effectiveDailyHours = requestedDailyHours
      ? Number(requestedDailyHours)
      : user?.dailyHours ?? 4;

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
      dailyHours: effectiveDailyHours,
      horizonDays: Number(horizonDays) || 14,
      todayStr,
    });

    let savedTasks = generatedTasks;

    if (commit === true && generatedTasks.length > 0) {
      // Clear previous uncompleted study/revision tasks to avoid duplicate buildup
      await TaskModel.deleteMany({
        userId,
        completed: false,
        type: { $in: ['study', 'revision'] },
      });

      const docsToInsert = generatedTasks.map((t) => ({
        userId,
        subjectId: t.subjectId || 'general',
        subjectName: t.subjectName || 'General',
        topicId: t.topicId || null,
        title: t.title,
        type: t.type || 'study',
        dueDate: t.dueDate || todayStr,
        scheduledDate: t.scheduledDate || todayStr,
        durationHours: t.durationHours || 2,
        priority: t.priority || 'medium',
        completed: false,
        completedAt: null,
        isRescheduled: false,
      }));

      const created = await TaskModel.insertMany(docsToInsert);
      savedTasks = created.map((doc) => ({
        ...doc.toObject(),
        id: doc._id.toString(),
        _id: doc._id.toString(),
      }));
    }

    return res.status(200).json({
      success: true,
      committed: Boolean(commit),
      dailyHours: effectiveDailyHours,
      tasksCount: savedTasks.length,
      planSummary: {
        totalHoursScheduled: Number(savedTasks.reduce((sum, t) => sum + (t.durationHours || 0), 0).toFixed(1)),
        revisionTasksCount: savedTasks.filter((t) => t.type === 'revision').length,
        studyTasksCount: savedTasks.filter((t) => t.type === 'study').length,
      },
      tasks: savedTasks,
    });
  } catch (error) {
    console.error('Planner generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate study plan.' });
  }
}

/**
 * POST /api/planner/reschedule-missed
 * Supports { commit: false } (preview) and { commit: true } (save)
 */
export async function handleRescheduleMissed(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { commit = false } = req.body || {};
    const todayStr = toDateString(new Date());
    const tomorrowStr = toDateString(new Date(Date.now() + 86400000));

    // Overdue tasks: scheduledDate < todayStr and not completed
    const overdueTasks = await TaskModel.find({
      userId,
      completed: false,
      scheduledDate: { $lt: todayStr },
    });

    const rescheduledTasks = buildRescheduleMissedPlan({
      missedTasks: overdueTasks,
      todayStr,
      tomorrowStr,
    });

    if (commit === true && overdueTasks.length > 0) {
      for (const resTask of rescheduledTasks) {
        await TaskModel.updateOne(
          { _id: resTask._id || resTask.id, userId },
          {
            $set: {
              scheduledDate: resTask.scheduledDate,
              dueDate: resTask.dueDate,
              isRescheduled: true,
            },
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      committed: Boolean(commit),
      rescheduledCount: rescheduledTasks.length,
      tasks: rescheduledTasks,
    });
  } catch (error) {
    console.error('Reschedule missed error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reschedule missed tasks.' });
  }
}
