import {
  getUser,
  getSubjects,
  getTodayTasks,
  getMissedTasks,
  getExams,
} from './plannerRepository.js';
import ChatMessageModel from '../models/ChatMessage.js';
import FlashcardQuizModel from '../models/FlashcardQuiz.js';

/**
 * Builds dynamic planner context for the AI Chatbot
 *
 * Uses Mongoose models scoped strictly by userId.
 * Injects:
 * 1. Current student profile & daily study limit
 * 2. Enrolled subjects and their overall status
 * 3. Today's scheduled tasks (completed vs pending)
 * 4. Upcoming exams within the next 14 days
 * 5. Missed / overdue tasks requiring attention
 * 6. Weak topics detected from quiz performance
 * 7. Last 5 conversational messages
 */
export async function buildPlannerContext(userId = 'default_student_1') {
  const [student, subjects, todayTasks, missedTasks, upcomingExams, dbWeakCards, recentDbMessages] =
    await Promise.all([
      getUser(userId),
      getSubjects(userId),
      getTodayTasks(userId),
      getMissedTasks(userId),
      getExams(userId, 14),
      FlashcardQuizModel.find({ userId, lastResult: 'incorrect' }).lean(),
      ChatMessageModel.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  // Calculate weak topics from quiz records for this user
  const weakTopics = dbWeakCards.map((f) => `${f.subjectName || 'General'}: ${f.topicName || f.question.slice(0, 30)}`);

  // Fetch last 5 messages for this user (chronological order)
  const recentMessages = recentDbMessages
    .reverse()
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`);

  const contextData = {
    student: {
      name: student?.name || 'Student',
      dailyAvailableHours: student?.dailyHours || 4,
    },
    subjects: subjects.map((s) => ({
      name: s.name,
      examDate: s.examDate,
      totalTopics: s.topics?.length || 0,
      completedTopics: (s.topics || []).filter((t) => t.status === 'completed').length,
    })),
    todayTasks: todayTasks.map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subjectName,
      priority: t.priority,
      completed: t.completed,
      durationHours: t.durationHours,
    })),
    missedTasks: missedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subjectName,
      dueDate: t.dueDate,
    })),
    upcomingExams,
    weakTopics: [...new Set(weakTopics)],
    recentMessagesSummary: recentMessages,
  };

  // Formatted markdown string for LLM system prompt
  const formattedPromptContext = `
[STUDENT PLANNER CONTEXT]
- Student Name: ${contextData.student.name}
- Target Daily Study Hours: ${contextData.student.dailyAvailableHours} hrs/day

UPCOMING EXAMS (Next 14 Days):
${
  contextData.upcomingExams.length > 0
    ? contextData.upcomingExams.map((e) => `• ${e.subject} in ${e.daysLeft} days (${e.examDate})`).join('\n')
    : '• No exams within the next 14 days.'
}

TODAY'S SCHEDULED TASKS:
${
  contextData.todayTasks.length > 0
    ? contextData.todayTasks
        .map(
          (t) =>
            `• [${t.completed ? 'DONE' : 'PENDING'}] ${t.title} (${t.subject}, Priority: ${t.priority}, Est: ${
              t.durationHours
            }h)`
        )
        .join('\n')
    : '• No tasks currently scheduled for today.'
}

MISSED / OVERDUE TASKS:
${
  contextData.missedTasks.length > 0
    ? contextData.missedTasks.map((t) => `• ⚠️ ${t.title} (due ${t.dueDate})`).join('\n')
    : '• No overdue tasks! All caught up.'
}

AREAS NEEDING REVIEW (Weak topics based on quizzes):
${
  contextData.weakTopics.length > 0
    ? contextData.weakTopics.map((w) => `• 🔍 ${w}`).join('\n')
    : '• Good retention so far; no critical weak topics detected.'
}
[END CONTEXT]
`;

  return {
    raw: contextData,
    promptText: formattedPromptContext,
  };
}
