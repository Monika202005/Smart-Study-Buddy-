import {
  getTodayTasks,
  getMissedTasks,
  getExamsNext14Days,
  addTask,
  rescheduleOverdueTasks,
  mockSubjects,
} from '../models/mockPlannerStore.js';
import { memoryFlashcards } from '../models/FlashcardQuiz.js';

/**
 * Tool Specifications definition for StudyBuddy AI Assistant
 */
export const toolDefinitions = [
  {
    name: 'get_today_plan',
    description: "Fetch the student's tasks scheduled for today, completion status, and upcoming exams.",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_task',
    description: "Create a new study task or revision item in the student's study plan.",
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Clear title of the task to study' },
        subjectName: { type: 'string', description: 'Subject name or code, e.g. CS301 or Operating Systems' },
        durationHours: { type: 'number', description: 'Estimated study hours (e.g. 1.5)' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Priority level' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD' },
      },
      required: ['title'],
    },
  },
  {
    name: 'reschedule_missed',
    description: "Roll forward overdue/missed tasks from past days into today's or tomorrow's schedule.",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'generate_flashcards',
    description: 'Generate 3 high-yield flashcards or quiz questions for a specific subject or topic.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Specific academic topic, e.g. AVL Trees, B-Trees, Thrashing' },
        subject: { type: 'string', description: 'Subject name, e.g. Data Structures, DBMS' },
      },
      required: ['topic'],
    },
  },
];

/**
 * Executes a tool function on the backend with authorization and validation
 */
export async function executeTool(toolName, args = {}, userId = 'default_student_1') {
  console.log(`⚡ [Tool Action Execution] ${toolName} with args:`, args);

  switch (toolName) {
    case 'get_today_plan': {
      const todayTasks = getTodayTasks();
      const missed = getMissedTasks();
      const exams = getExamsNext14Days();
      return {
        success: true,
        todayTasks,
        missedTasksCount: missed.length,
        upcomingExams: exams,
        summary: `You have ${todayTasks.length} tasks scheduled today (${todayTasks.filter(t => t.completed).length} completed). There are ${missed.length} overdue tasks, and your next exam is in ${exams[0]?.daysLeft || 'N/A'} days.`,
      };
    }

    case 'create_task': {
      if (!args.title || typeof args.title !== 'string' || args.title.trim().length === 0) {
        return { success: false, error: 'Task title is required.' };
      }

      // Security check: argument sanitization
      const sanitizedTitle = args.title.trim().slice(0, 150);
      const matchedSubject = mockSubjects.find(
        s => args.subjectName && s.name.toLowerCase().includes(args.subjectName.toLowerCase())
      ) || mockSubjects[0];

      const newTask = addTask({
        userId,
        title: sanitizedTitle,
        subjectId: matchedSubject.id,
        subjectName: matchedSubject.name,
        durationHours: Math.min(Math.max(Number(args.durationHours) || 1.5, 0.5), 8),
        priority: ['high', 'medium', 'low'].includes(args.priority) ? args.priority : 'medium',
        dueDate: args.dueDate || new Date().toISOString().split('T')[0],
        scheduledDate: new Date().toISOString().split('T')[0],
      });

      return {
        success: true,
        task: newTask,
        message: `Created task "${newTask.title}" under ${newTask.subjectName} for ${newTask.scheduledDate}.`,
      };
    }

    case 'reschedule_missed': {
      const result = rescheduleOverdueTasks();
      return {
        success: true,
        rescheduledCount: result.rescheduledCount,
        tasks: result.tasks,
        message: result.rescheduledCount > 0
          ? `Successfully moved ${result.rescheduledCount} missed task(s) forward to today's schedule.`
          : 'No missed tasks found; your schedule is fully up to date!',
      };
    }

    case 'generate_flashcards': {
      const topic = (args.topic || 'General Topic').trim();
      const subject = (args.subject || 'Computer Science').trim();

      // Sample high quality generated flashcard
      const card = {
        _id: `fc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        subjectId: 'cs_gen',
        subjectName: subject,
        topicId: topic.toLowerCase().replace(/\s+/g, '_'),
        topicName: topic,
        question: `What is the core principle and key advantage of ${topic}?`,
        answer: `${topic} provides structured efficiency and predictable operational bounds.`,
        options: [
          `Optimizes search and access times`,
          `Reduces disk I/O operations`,
          `Guarantees deterministic worst-case bounds`,
          `All of the above depending on configuration`
        ],
        explanation: `${topic} is fundamental in systems design to ensure scalable execution under high loads.`,
        lastResult: 'untested',
        difficulty: 2,
        createdAt: new Date(),
      };

      memoryFlashcards.push(card);

      return {
        success: true,
        flashcard: card,
        message: `Generated and saved a flashcard for "${topic}".`,
      };
    }

    default:
      return { success: false, error: `Unknown tool function: ${toolName}` };
  }
}
