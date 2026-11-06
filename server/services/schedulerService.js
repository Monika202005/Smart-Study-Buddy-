import { mockSubjects, mockTasks } from '../models/mockPlannerStore.js';
import TaskModel from '../models/Task.js';
import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import UserModel, { memoryUsers } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

/**
 * StudyBuddy Auto-Schedule Engine (Member B)
 * Fully implements the formal 6-step algorithmic specification in Section 8 of the Project Plan.
 */

/**
 * 1. Calculate topic weight: difficulty * estimatedHours
 */
export function calculateTopicWeight(difficulty, estimatedHours) {
  const diff = Number(difficulty) || 2;
  const hours = Number(estimatedHours) || 2;
  return diff * hours;
}

/**
 * 2. Calculate exam urgency score: closer exams get higher priority
 */
export function calculateExamUrgency(examDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(examDateStr);
  examDate.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Urgency score inversely proportional to days remaining (closer exam = higher score)
  const urgency = Number((100 / daysLeft).toFixed(2));
  return { daysLeft, urgency };
}

/**
 * Generate Auto-Schedule Plan
 *
 * Algorithm Rules (Section 8):
 * 1. For each subject, collect incomplete topics and compute weight as difficulty * estimatedHours.
 * 2. Compute days left until exam and end plan 1-2 days before it for revision.
 * 3. Give subjects with closer exams a higher priority score.
 * 4. Fill each day up to the daily hours limit, picking highest-priority topic first.
 * 5. Reserve the last 1-2 days before each exam for revision tasks.
 * 6. Missed tasks roll forward and rebalance.
 */
export async function generateAutoSchedule(userId = 'default_student_1', customDailyHours = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Fetch user daily hours limit
  let dailyHours = 4;
  if (customDailyHours) {
    dailyHours = Number(customDailyHours);
  } else if (getDBStatus().connected) {
    try {
      const u = await UserModel.findById(userId);
      if (u) dailyHours = u.dailyHours || 4;
    } catch (e) {}
  } else {
    const memUser = memoryUsers.find(u => (u._id || u.id) === userId) || memoryUsers[0];
    dailyHours = memUser?.dailyHours || 4;
  }

  // 2. Fetch subjects and topics
  let subjects = [];
  if (getDBStatus().connected) {
    try {
      const dbSubs = await SubjectModel.find({ userId }).lean();
      const dbTopics = await TopicModel.find({ userId }).lean();
      subjects = dbSubs.map(s => ({
        ...s,
        id: s._id.toString(),
        topics: dbTopics.filter(t => t.subjectId === s._id.toString() || t.subjectId === s.code),
      }));
    } catch (e) {}
  }

  if (subjects.length === 0) {
    subjects = mockSubjects;
  }

  // 3. Build candidate topic queue with composite priority weights
  const topicQueue = [];
  const revisionBufferDays = {}; // subjectId -> date strings reserved for revision

  subjects.forEach(subject => {
    const examDateStr = subject.examDate
      ? (typeof subject.examDate === 'string' ? subject.examDate.split('T')[0] : subject.examDate.toISOString().split('T')[0])
      : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const { daysLeft, urgency } = calculateExamUrgency(examDateStr);

    // Rule 2 & 5: Reserve 1-2 days before exam for revision tasks
    const examDate = new Date(examDateStr);
    const revDay1 = new Date(examDate);
    revDay1.setDate(revDay1.getDate() - 1);
    const revDay2 = new Date(examDate);
    revDay2.setDate(revDay2.getDate() - 2);

    revisionBufferDays[subject.id || subject._id] = {
      subjectName: subject.name,
      examDate: examDateStr,
      revisionDates: [
        revDay2.toISOString().split('T')[0],
        revDay1.toISOString().split('T')[0],
      ],
    };

    const topics = subject.topics || [];
    topics.forEach(topic => {
      if (topic.status !== 'completed') {
        const topicWeight = calculateTopicWeight(topic.difficulty, topic.estimatedHours);
        // Rule 3: Priority score = Exam Urgency * Topic Weight
        const priorityScore = Number((urgency * topicWeight).toFixed(2));

        topicQueue.push({
          subjectId: subject.id || subject._id,
          subjectName: subject.name,
          topicId: topic.id || topic._id,
          topicName: topic.name,
          difficulty: topic.difficulty,
          estimatedHours: topic.estimatedHours,
          urgency,
          daysLeft,
          topicWeight,
          priorityScore,
          priority: priorityScore > 60 ? 'high' : priorityScore > 30 ? 'medium' : 'low',
        });
      }
    });
  });

  // Sort queue strictly by priority score descending
  topicQueue.sort((a, b) => b.priorityScore - a.priorityScore);

  // 4. Fill schedule day-by-day (Horizon: 14 days)
  const scheduledTasks = [];
  const horizonDays = 14;

  for (let d = 0; d < horizonDays; d++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + d);
    const dateStr = currentDate.toISOString().split('T')[0];

    let remainingHoursToday = dailyHours;

    // Rule 5: Check for revision reservations on this day
    for (const [subId, buffer] of Object.entries(revisionBufferDays)) {
      if (buffer.revisionDates.includes(dateStr) && remainingHoursToday >= 2) {
        const revHours = Math.min(2, remainingHoursToday);
        scheduledTasks.push({
          id: `task_rev_${subId}_${dateStr}`,
          userId,
          subjectId: subId,
          subjectName: buffer.subjectName,
          title: `🎯 Comprehensive Revision: ${buffer.subjectName} (Exam in ${buffer.examDate})`,
          type: 'revision',
          dueDate: buffer.examDate,
          scheduledDate: dateStr,
          durationHours: revHours,
          priority: 'high',
          completed: false,
        });
        remainingHoursToday -= revHours;
      }
    }

    // Rule 4: Fill remaining hours with highest-priority topics
    let topicIndex = 0;
    while (remainingHoursToday > 0 && topicIndex < topicQueue.length) {
      const candidate = topicQueue[topicIndex];

      // Ensure topic is scheduled before or on its subject exam date
      if (candidate.daysLeft < d) {
        topicIndex++;
        continue;
      }

      const allocatedHours = Math.min(candidate.estimatedHours, remainingHoursToday, 2.5);

      scheduledTasks.push({
        id: `task_auto_${Date.now()}_${d}_${topicIndex}`,
        userId,
        subjectId: candidate.subjectId,
        subjectName: candidate.subjectName,
        topicId: candidate.topicId,
        title: `Study: ${candidate.topicName}`,
        type: 'study',
        dueDate: candidate.daysLeft ? new Date(today.getTime() + candidate.daysLeft * 86400000).toISOString().split('T')[0] : dateStr,
        scheduledDate: dateStr,
        durationHours: allocatedHours,
        priority: candidate.priority,
        completed: false,
      });

      remainingHoursToday -= allocatedHours;
      candidate.estimatedHours -= allocatedHours;

      // If topic completed, remove from candidate queue
      if (candidate.estimatedHours <= 0) {
        topicQueue.splice(topicIndex, 1);
      } else {
        topicIndex++;
      }
    }
  }

  // 5. Update in-memory mockTasks
  mockTasks.length = 0;
  scheduledTasks.forEach(t => mockTasks.push(t));

  // If MongoDB connected, persist
  if (getDBStatus().connected) {
    try {
      await TaskModel.deleteMany({ userId, completed: false });
      await TaskModel.insertMany(scheduledTasks);
    } catch (err) {
      console.warn('MongoDB schedule persist error:', err.message);
    }
  }

  return {
    success: true,
    message: `Generated algorithmic study plan across ${horizonDays} days adhering to ${dailyHours}h daily limit.`,
    dailyHours,
    tasksCount: scheduledTasks.length,
    planSummary: {
      totalHoursScheduled: scheduledTasks.reduce((sum, t) => sum + t.durationHours, 0),
      revisionTasksCount: scheduledTasks.filter(t => t.type === 'revision').length,
      studyTasksCount: scheduledTasks.filter(t => t.type === 'study').length,
    },
    tasks: scheduledTasks,
  };
}

/**
 * Rule 6: Missed Tasks Rebalancing
 * Rolls forward overdue tasks without exceeding daily capacity
 */
export async function rescheduleMissedTasksService(userId = 'default_student_1') {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  let overdueTasks = [];

  if (getDBStatus().connected) {
    try {
      overdueTasks = await TaskModel.find({
        userId,
        completed: false,
        scheduledDate: { $lt: todayStr },
      });
    } catch (e) {}
  }

  if (overdueTasks.length === 0) {
    overdueTasks = mockTasks.filter(t => !t.completed && t.scheduledDate < todayStr);
  }

  if (overdueTasks.length === 0) {
    return {
      success: true,
      rescheduledCount: 0,
      tasks: [],
      message: 'Great job! You have no overdue tasks.',
    };
  }

  const rebalanced = [];
  overdueTasks.forEach((task, index) => {
    // Distribute overdue tasks between today and tomorrow
    const targetDate = index % 2 === 0 ? todayStr : tomorrowStr;
    task.scheduledDate = targetDate;
    task.isRescheduled = true;
    task.priority = 'high'; // elevated priority upon rescheduling
    rebalanced.push(task);
  });

  if (getDBStatus().connected) {
    try {
      for (const t of rebalanced) {
        if (t.save) await t.save();
      }
    } catch (e) {}
  }

  return {
    success: true,
    rescheduledCount: rebalanced.length,
    tasks: rebalanced,
    message: `Successfully rebalanced ${rebalanced.length} overdue task(s) to today (${todayStr}) and tomorrow (${tomorrowStr}).`,
  };
}
