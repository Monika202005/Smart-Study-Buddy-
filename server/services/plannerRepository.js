/**
 * Planner Data Access Repository
 *
 * Real Mongoose-backed data access layer for student tasks, subjects, and exams.
 * Queries Mongoose models strictly scoped by userId.
 */

import UserModel from '../models/User.js';
import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import TaskModel from '../models/Task.js';
import { toDateString } from './analyticsService.js';

/**
 * Calculates calendar days difference between targetDateStr and today.
 */
export function calculateCalendarDaysLeft(targetDateStr) {
  if (!targetDateStr) return 0;
  const parts = (typeof targetDateStr === 'string' && targetDateStr.includes('T')
    ? targetDateStr.split('T')[0]
    : typeof targetDateStr === 'string'
    ? targetDateStr
    : new Date(targetDateStr).toISOString().split('T')[0]
  ).split('-').map(Number);

  const [year, month, day] = parts;
  const targetMidnight = new Date(year, month - 1, day, 0, 0, 0, 0);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Fetch user profile
 */
export async function getUser(userId) {
  if (!userId) return null;
  const user = await UserModel.findById(userId).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    dailyHours: user.dailyHours || 4,
    theme: user.theme || 'dark',
  };
}

/**
 * Fetch subjects with nested topics for a user
 */
export async function getSubjects(userId) {
  if (!userId) return [];
  const [subjects, topics] = await Promise.all([
    SubjectModel.find({ userId }).sort({ examDate: 1 }).lean(),
    TopicModel.find({ userId }).lean(),
  ]);

  return subjects.map((s) => ({
    ...s,
    id: s._id.toString(),
    _id: s._id.toString(),
    topics: topics
      .filter((t) => t.subjectId === s._id.toString() || t.subjectId === s.code)
      .map((t) => ({
        ...t,
        id: t._id.toString(),
        _id: t._id.toString(),
      })),
  }));
}

/**
 * Fetch all tasks scheduled for today for a given user
 */
export async function getTodayTasks(userId) {
  if (!userId) return [];
  const todayStr = toDateString(new Date());
  const tasks = await TaskModel.find({ userId, scheduledDate: todayStr }).lean();
  return tasks.map((t) => ({
    ...t,
    id: t._id.toString(),
    _id: t._id.toString(),
  }));
}

/**
 * Fetch all incomplete tasks with a scheduledDate prior to today for a given user
 */
export async function getMissedTasks(userId) {
  if (!userId) return [];
  const todayStr = toDateString(new Date());
  const tasks = await TaskModel.find({
    userId,
    completed: false,
    scheduledDate: { $lt: todayStr },
  }).lean();

  return tasks.map((t) => ({
    ...t,
    id: t._id.toString(),
    _id: t._id.toString(),
  }));
}

/**
 * Add a new study task for a given user
 */
export async function addTask(userId, taskData = {}) {
  const doc = await TaskModel.create({
    userId,
    subjectId: taskData.subjectId || 'general',
    subjectName: taskData.subjectName || taskData.subject || 'General Study',
    topicId: taskData.topicId || null,
    title: taskData.title,
    type: taskData.type || 'study',
    dueDate: taskData.dueDate || toDateString(new Date()),
    scheduledDate: taskData.scheduledDate || toDateString(new Date()),
    durationHours: Number(taskData.durationHours) || 2,
    priority: taskData.priority || 'medium',
    completed: false,
    completedAt: null,
    isRescheduled: false,
  });

  return {
    ...doc.toObject(),
    id: doc._id.toString(),
    _id: doc._id.toString(),
  };
}

/**
 * Reschedule all overdue/missed tasks for a given user forward to today/tomorrow
 */
export async function rescheduleOverdue(userId) {
  if (!userId) return { rescheduledCount: 0, tasks: [] };
  const todayStr = toDateString(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  const missed = await TaskModel.find({
    userId,
    completed: false,
    scheduledDate: { $lt: todayStr },
  });

  const updatedTasks = [];
  for (const t of missed) {
    t.scheduledDate = todayStr;
    t.dueDate = tomorrowStr;
    t.isRescheduled = true;
    await t.save();
    updatedTasks.push({
      ...t.toObject(),
      id: t._id.toString(),
      _id: t._id.toString(),
    });
  }

  return {
    rescheduledCount: updatedTasks.length,
    tasks: updatedTasks,
  };
}

/**
 * Fetch upcoming exams within a specified horizon (default: 14 days)
 */
export async function getExams(userId, days = 14) {
  if (!userId) return [];
  const subjects = await SubjectModel.find({ userId, examDate: { $ne: null } }).lean();

  return subjects
    .map((s) => {
      const daysLeft = calculateCalendarDaysLeft(s.examDate);
      return {
        subject: s.name,
        examDate: toDateString(s.examDate),
        daysLeft,
      };
    })
    .filter((s) => s.daysLeft >= 0 && s.daysLeft <= days);
}
