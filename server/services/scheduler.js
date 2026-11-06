/**
 * Pure Algorithmic Study Planner & Scheduler Engine
 *
 * Implements:
 * 1. Topic weight = difficulty * estimatedHours for unfinished topics.
 * 2. Exam urgency = closer exams receive higher priority.
 * 3. Daily capacity = fill each day up to dailyHours, highest priority first.
 * 4. Exam buffer = reserve 1-2 days before each exam for revision tasks.
 * 5. Exam boundary = regular study topics are NEVER scheduled after their exam date.
 * 6. Non-past = never schedule in the past (starts on todayStr).
 * 7. Determinism = identical inputs always produce identical schedules.
 */

import { toDateString } from './analyticsService.js';

export function calculateTopicWeight(difficulty, estimatedHours) {
  const d = Math.max(Number(difficulty) || 1, 1);
  const h = Math.max(Number(estimatedHours) || 0.5, 0.5);
  return Number((d * h).toFixed(2));
}

export function calculateExamUrgency(examDateStr, todayStr = toDateString(new Date())) {
  const [ey, em, ed] = examDateStr.split('T')[0].split('-').map(Number);
  const [ty, tm, td] = todayStr.split('T')[0].split('-').map(Number);

  const examDate = new Date(ey, em - 1, ed, 0, 0, 0);
  const today = new Date(ty, tm - 1, td, 0, 0, 0);

  const diffMs = examDate.getTime() - today.getTime();
  const daysLeft = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  // Urgency inversely proportional to daysLeft
  const urgency = Number((100 / daysLeft).toFixed(2));
  return { daysLeft, urgency };
}

/**
 * Pure scheduling function.
 *
 * @param {Object} params
 * @param {Array} params.subjects - [{ id, name, examDate, color }]
 * @param {Array} params.topics - [{ id, subjectId, name, difficulty, estimatedHours, status }]
 * @param {number} params.dailyHours - daily study limit (hours)
 * @param {number} params.horizonDays - number of days to schedule (default 14)
 * @param {string} params.todayStr - YYYY-MM-DD start date
 * @returns {Array} generated task objects
 */
export function buildSchedulePlan({
  subjects = [],
  topics = [],
  dailyHours = 4,
  horizonDays = 14,
  todayStr = toDateString(new Date()),
}) {
  const limit = Math.max(Number(dailyHours) || 2, 1);
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const startDate = new Date(ty, tm - 1, td, 0, 0, 0);

  // 1. Process subjects & precompute revision buffers and exam day boundaries
  const subjectMap = new Map();
  const revisionBufferDays = new Map(); // dateStr -> Array<{ subjectId, subjectName, examDateStr }>

  subjects.forEach((sub) => {
    const subId = (sub._id || sub.id || '').toString();
    const examDateStr = sub.examDate ? toDateString(sub.examDate) : null;
    const { daysLeft, urgency } = examDateStr
      ? calculateExamUrgency(examDateStr, todayStr)
      : { daysLeft: 999, urgency: 1 };

    subjectMap.set(subId, {
      id: subId,
      name: sub.name,
      code: sub.code || '',
      color: sub.color || '#6366f1',
      examDateStr,
      daysLeft,
      urgency,
    });

    if (examDateStr && daysLeft > 0 && daysLeft <= horizonDays + 2) {
      const [ey, em, ed] = examDateStr.split('-').map(Number);
      const examDate = new Date(ey, em - 1, ed, 0, 0, 0);

      // Reserve 1 and 2 days before exam for revision
      const revDays = [1, 2];
      revDays.forEach((offset) => {
        const revDate = new Date(examDate);
        revDate.setDate(revDate.getDate() - offset);
        const revStr = toDateString(revDate);
        if (revStr >= todayStr) {
          if (!revisionBufferDays.has(revStr)) {
            revisionBufferDays.set(revStr, []);
          }
          revisionBufferDays.get(revStr).push({
            subjectId: subId,
            subjectName: sub.name,
            examDateStr,
          });
        }
      });
    }
  });

  // 2. Build prioritized topic queue for incomplete topics
  const candidateTopics = [];
  topics.forEach((t) => {
    if (t.status === 'completed') return;

    const subId = (t.subjectId || '').toString();
    const sub = subjectMap.get(subId);
    const subjectName = sub?.name || 'General';
    const urgency = sub?.urgency || 1;
    const examDateStr = sub?.examDateStr || null;

    const weight = calculateTopicWeight(t.difficulty, t.estimatedHours);
    const priorityScore = Number((urgency * weight).toFixed(2));

    candidateTopics.push({
      topicId: (t._id || t.id || '').toString(),
      name: t.name,
      subjectId: subId,
      subjectName,
      difficulty: t.difficulty || 2,
      remainingHours: Number(t.estimatedHours) || 2,
      urgency,
      weight,
      priorityScore,
      examDateStr,
    });
  });

  // Sort candidate topics deterministically: priorityScore DESC, then weight DESC, then topicId
  candidateTopics.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.topicId.localeCompare(b.topicId);
  });

  const scheduledTasks = [];

  // 3. Allocate day by day
  for (let d = 0; d < horizonDays; d++) {
    const current = new Date(startDate);
    current.setDate(current.getDate() + d);
    const dateStr = toDateString(current);

    let dayRemainingHours = limit;

    // Rule 4: Reserve revision tasks for exams coming up in 1-2 days
    if (revisionBufferDays.has(dateStr)) {
      const bufferList = revisionBufferDays.get(dateStr);
      for (const buffer of bufferList) {
        if (dayRemainingHours <= 0) break;
        const revHours = Math.min(2, dayRemainingHours);
        scheduledTasks.push({
          title: `🎯 Revision: ${buffer.subjectName}`,
          subjectId: buffer.subjectId,
          subjectName: buffer.subjectName,
          type: 'revision',
          dueDate: buffer.examDateStr,
          scheduledDate: dateStr,
          durationHours: revHours,
          priority: 'high',
          completed: false,
          isRescheduled: false,
        });
        dayRemainingHours -= revHours;
      }
    }

    // Rule 3: Fill remaining capacity with highest priority study topics
    let topicIdx = 0;
    while (dayRemainingHours > 0.25 && topicIdx < candidateTopics.length) {
      const candidate = candidateTopics[topicIdx];

      // Rule 5 & 6: Never schedule study tasks on or after their exam date
      if (candidate.examDateStr && dateStr >= candidate.examDateStr) {
        topicIdx++;
        continue;
      }

      const hoursToAllocate = Math.min(candidate.remainingHours, dayRemainingHours, 2.0);

      scheduledTasks.push({
        title: `Study: ${candidate.name}`,
        subjectId: candidate.subjectId,
        subjectName: candidate.subjectName,
        topicId: candidate.topicId,
        type: 'study',
        dueDate: candidate.examDateStr || dateStr,
        scheduledDate: dateStr,
        durationHours: Number(hoursToAllocate.toFixed(2)),
        priority: candidate.priorityScore >= 50 ? 'high' : candidate.priorityScore >= 20 ? 'medium' : 'low',
        completed: false,
        isRescheduled: false,
      });

      dayRemainingHours = Number((dayRemainingHours - hoursToAllocate).toFixed(2));
      candidate.remainingHours = Number((candidate.remainingHours - hoursToAllocate).toFixed(2));

      if (candidate.remainingHours <= 0.05) {
        candidateTopics.splice(topicIdx, 1);
      } else {
        topicIdx++;
      }
    }
  }

  return scheduledTasks;
}

/**
 * Pure reschedule function for missed/overdue tasks.
 */
export function buildRescheduleMissedPlan({
  missedTasks,
  overdueTasks,
  todayStr = toDateString(new Date()),
  tomorrowStr = toDateString(new Date(Date.now() + 86400000)),
}) {
  const tasks = missedTasks || overdueTasks || [];
  return tasks.map((t, index) => {
    const isOdd = index % 2 === 1;
    const newDate = isOdd ? tomorrowStr : todayStr;
    const taskObj = t.toObject ? t.toObject() : { ...t };
    return {
      ...taskObj,
      id: (taskObj._id || taskObj.id || '').toString(),
      scheduledDate: newDate,
      dueDate: taskObj.dueDate && taskObj.dueDate < newDate ? newDate : (taskObj.dueDate || newDate),
      isRescheduled: true,
      priority: 'high',
    };
  });
}

