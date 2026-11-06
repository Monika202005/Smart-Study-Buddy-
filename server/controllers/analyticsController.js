import StudySessionModel from '../models/StudySession.js';
import TaskModel from '../models/Task.js';
import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import UserModel from '../models/User.js';
import { calculateStreak, calculateCalendarDaysLeft, toDateString } from '../services/analyticsService.js';

/**
 * GET /api/analytics/summary
 * Aggregate user study statistics purely from the authenticated user's data
 */
export async function getAnalyticsSummary(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const todayStr = toDateString(new Date());

    // Fetch user profile, subjects, topics, tasks, and recent sessions in parallel
    const [user, subjects, topics, tasks, sessions] = await Promise.all([
      UserModel.findById(userId).lean(),
      SubjectModel.find({ userId }).sort({ examDate: 1 }).lean(),
      TopicModel.find({ userId }).lean(),
      TaskModel.find({ userId }).lean(),
      StudySessionModel.find({ userId }).sort({ date: -1 }).lean(),
    ]);

    const dailyHours = user?.dailyHours ?? 2;
    const dailyGoalMinutes = dailyHours * 60;

    // 1. Today's tasks
    const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
    const todayTasksTotal = todayTasks.length;
    const todayTasksDone = todayTasks.filter((t) => t.completed).length;

    // 2. Minutes logged today
    const todaySessions = sessions.filter((s) => s.date === todayStr);
    const minutesLoggedToday = todaySessions.reduce((acc, s) => acc + (s.durationMin || 0), 0);

    // 3. Overall task completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 4. Hours per subject (aggregated from actual sessions)
    const subjectMap = new Map();
    subjects.forEach((sub) => {
      subjectMap.set(sub._id.toString(), {
        subjectId: sub._id.toString(),
        subjectName: sub.name,
        color: sub.color || '#6366f1',
        minutes: 0,
      });
    });

    sessions.forEach((sess) => {
      if (sess.subjectId && subjectMap.has(sess.subjectId)) {
        subjectMap.get(sess.subjectId).minutes += sess.durationMin || 0;
      } else {
        const key = sess.subjectName || 'Other';
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            subjectId: key,
            subjectName: key,
            color: '#8b5cf6',
            minutes: 0,
          });
        }
        subjectMap.get(key).minutes += sess.durationMin || 0;
      }
    });

    const hoursPerSubject = Array.from(subjectMap.values()).map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      color: s.color,
      hours: Number((s.minutes / 60).toFixed(1)),
      minutes: s.minutes,
    }));

    // 5. Minutes per day for last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const minutesPerDayLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = toDateString(d);
      const dayName = dayNames[d.getDay()];

      const daySessions = sessions.filter((s) => s.date === dStr);
      const dayMinutes = daySessions.reduce((acc, s) => acc + (s.durationMin || 0), 0);

      minutesPerDayLast7Days.push({
        date: dStr,
        day: dayName,
        minutes: dayMinutes,
        hours: Number((dayMinutes / 60).toFixed(1)),
        targetMinutes: dailyGoalMinutes,
      });
    }

    // 6. Syllabus completion per subject
    const syllabusCompletion = subjects.map((sub) => {
      const subIdStr = sub._id.toString();
      const subTopics = topics.filter((t) => t.subjectId === subIdStr || t.subjectId === sub.code);
      const totalTopics = subTopics.length;
      const completedTopics = subTopics.filter((t) => t.status === 'completed').length;
      const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        subjectId: subIdStr,
        subjectName: sub.name,
        color: sub.color,
        totalTopics,
        completedTopics,
        percentage,
      };
    });

    // 7. Active study days & Streak calculation
    const activeDateStrings = new Set();
    sessions.forEach((s) => {
      if (s.date) activeDateStrings.add(s.date);
    });
    tasks.forEach((t) => {
      if (t.completed && t.completedAt) {
        activeDateStrings.add(toDateString(t.completedAt));
      }
    });

    const currentStreak = calculateStreak(activeDateStrings, todayStr);

    // Keep UserModel streak synchronized if changed
    if (user && user.streak !== currentStreak) {
      await UserModel.findByIdAndUpdate(userId, { streak: currentStreak }).catch(() => {});
    }

    // 8. Next exam with days left (calendar-day difference at local midnight)
    const upcomingExams = subjects
      .filter((s) => s.examDate)
      .map((s) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        color: s.color,
        examDate: s.examDate ? toDateString(s.examDate) : '',
        daysLeft: calculateCalendarDaysLeft(s.examDate),
      }))
      .filter((s) => s.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const nextExam = upcomingExams[0] || null;

    return res.status(200).json({
      success: true,
      summary: {
        todayTasksDone,
        todayCompletedTasks: todayTasksDone,
        todayTasksTotal,
        minutesLoggedToday,
        minutesToday: minutesLoggedToday,
        hoursLoggedToday: Number((minutesLoggedToday / 60).toFixed(1)),
        dailyGoalMinutes,
        dailyHours,
        totalTasks,
        completedTasks,
        completionRate,
        streak: currentStreak,
        hoursPerSubject,
        minutesPerDayLast7Days,
        syllabusCompletion,
        nextExam,
        upcomingExams,
      },
    });
  } catch (error) {
    console.error('Analytics summary calculation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to compute analytics summary.' });
  }
}
