import {
  mockUser,
  mockSubjects,
  getTodayTasks,
  getMissedTasks,
  getExamsNext14Days,
} from '../models/mockPlannerStore.js';
import { memoryChatMessages } from '../models/ChatMessage.js';
import { memoryFlashcards } from '../models/FlashcardQuiz.js';

/**
 * Builds dynamic planner context for the AI Chatbot
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
  const todayTasks = getTodayTasks();
  const missedTasks = getMissedTasks();
  const upcomingExams = getExamsNext14Days();
  
  // Calculate weak topics from quiz records
  const weakTopics = memoryFlashcards
    .filter(f => f.userId === userId && f.lastResult === 'incorrect')
    .map(f => `${f.subjectName}: ${f.topicName}`);

  // Fetch last 5 messages
  const recentMessages = memoryChatMessages
    .filter(m => m.userId === userId)
    .slice(-5)
    .map(m => `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`);

  const contextData = {
    student: {
      name: mockUser.name,
      dailyAvailableHours: mockUser.dailyHours,
    },
    subjects: mockSubjects.map(s => ({
      name: s.name,
      examDate: s.examDate,
      totalTopics: s.topics.length,
      completedTopics: s.topics.filter(t => t.status === 'completed').length,
    })),
    todayTasks: todayTasks.map(t => ({
      id: t.id,
      title: t.title,
      subject: t.subjectName,
      priority: t.priority,
      completed: t.completed,
      durationHours: t.durationHours,
    })),
    missedTasks: missedTasks.map(t => ({
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
${contextData.upcomingExams.length > 0 
  ? contextData.upcomingExams.map(e => `• ${e.subject} in ${e.daysLeft} days (${e.examDate})`).join('\n')
  : '• No exams within the next 14 days.'}

TODAY'S SCHEDULED TASKS:
${contextData.todayTasks.length > 0
  ? contextData.todayTasks.map(t => `• [${t.completed ? 'DONE' : 'PENDING'}] ${t.title} (${t.subject}, Priority: ${t.priority}, Est: ${t.durationHours}h)`).join('\n')
  : '• No tasks currently scheduled for today.'}

MISSED / OVERDUE TASKS:
${contextData.missedTasks.length > 0
  ? contextData.missedTasks.map(t => `• ⚠️ ${t.title} (due ${t.dueDate})`).join('\n')
  : '• No overdue tasks! All caught up.'}

AREAS NEEDING REVIEW (Weak topics based on quizzes):
${contextData.weakTopics.length > 0
  ? contextData.weakTopics.map(w => `• 🔍 ${w}`).join('\n')
  : '• Good retention so far; no critical weak topics detected.'}
[END CONTEXT]
`;

  return {
    raw: contextData,
    promptText: formattedPromptContext,
  };
}
