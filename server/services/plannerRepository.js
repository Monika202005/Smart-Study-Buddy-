/**
 * Planner Data Access Repository
 *
 * Central data access layer abstracting student tasks, subjects, and exams.
 * Currently backed by mockPlannerStore.
 * Member B can swap in Mongoose models by modifying this file without touching
 * chatbotService or chatbotTools.
 */

import {
  mockUser,
  mockSubjects,
  mockTasks,
  addTask as storeAddTask,
} from '../models/mockPlannerStore.js';

/**
 * Fetch all tasks scheduled for today for a given user
 */
export async function getTodayTasks(userId = 'default_student_1') {
  const todayStr = new Date().toISOString().split('T')[0];
  return mockTasks.filter(
    (t) => (t.userId === userId || !t.userId) && t.scheduledDate === todayStr
  );
}

/**
 * Fetch all incomplete tasks with a scheduledDate prior to today for a given user
 */
export async function getMissedTasks(userId = 'default_student_1') {
  const todayStr = new Date().toISOString().split('T')[0];
  return mockTasks.filter(
    (t) => (t.userId === userId || !t.userId) && !t.completed && t.scheduledDate < todayStr
  );
}

/**
 * Add a new study task for a given user
 */
export async function addTask(userId = 'default_student_1', taskData = {}) {
  const newTask = storeAddTask({
    ...taskData,
    userId,
  });
  return newTask;
}

/**
 * Reschedule all overdue/missed tasks for a given user forward to today/tomorrow
 */
export async function rescheduleOverdue(userId = 'default_student_1') {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const missed = await getMissedTasks(userId);

  missed.forEach((t) => {
    t.scheduledDate = todayStr;
    t.dueDate = tomorrowStr;
  });

  return {
    rescheduledCount: missed.length,
    tasks: missed,
  };
}

/**
 * Fetch upcoming exams within a specified horizon (default: 14 days)
 */
export async function getExams(userId = 'default_student_1', days = 14) {
  const today = new Date();
  const limit = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return mockSubjects
    .filter((s) => {
      const exam = new Date(s.examDate);
      return exam >= today && exam <= limit;
    })
    .map((s) => {
      const daysLeft = Math.ceil((new Date(s.examDate) - today) / (1000 * 60 * 60 * 24));
      return {
        subject: s.name,
        examDate: s.examDate,
        daysLeft,
      };
    });
}

/**
 * Fetch student profile
 */
export async function getUser(userId = 'default_student_1') {
  return mockUser;
}

/**
 * Fetch enrolled subjects for student
 */
export async function getSubjects(userId = 'default_student_1') {
  return mockSubjects;
}
