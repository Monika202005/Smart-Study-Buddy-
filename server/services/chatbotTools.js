import {
  getTodayTasks,
  getMissedTasks,
  getExams,
  addTask,
  rescheduleOverdue,
  getSubjects,
} from './plannerRepository.js';
import FlashcardQuizModel, { memoryFlashcards } from '../models/FlashcardQuiz.js';
import { getDBStatus } from '../config/db.js';
import { validateToolArguments } from './toolValidator.js';

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
        durationHours: { type: 'number', description: 'Estimated study hours (e.g. 1.5, between 0.5 and 8)' },
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
    description: 'Generate high-yield flashcards or quiz questions for a specific subject or topic (max 10 cards).',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Specific academic topic, e.g. AVL Trees, B-Trees, Virtual Memory' },
        subject: { type: 'string', description: 'Subject name, e.g. Data Structures, DBMS, Operating Systems' },
        count: { type: 'number', description: 'Number of flashcards to generate (1-10, default: 3)' },
      },
      required: ['topic'],
    },
  },
];

/**
 * Curated high-yield flashcards fallback when LLM is unavailable or fails schema validation
 */
function getCuratedCards(topic, subject, count) {
  const tLower = topic.toLowerCase();
  const pool = [];

  if (tLower.includes('tree') || tLower.includes('avl') || tLower.includes('bst')) {
    pool.push(
      {
        question: `What is the maximum allowed balance factor for any node in an AVL Tree?`,
        answer: `The balance factor must be -1, 0, or +1.`,
        options: ['Strictly 0', '-1, 0, or +1', 'Between -2 and +2', 'Depends on tree depth'],
        explanation: `AVL trees maintain O(log n) search height by rebalancing whenever |Height(left) - Height(right)| exceeds 1.`,
        difficulty: 2,
      },
      {
        question: `Which rotation is performed on an AVL Tree when a left-heavy subtree receives an insertion into the right child?`,
        answer: `Left-Right (LR) double rotation.`,
        options: ['Single Left rotation', 'Single Right rotation', 'Left-Right (LR) rotation', 'Right-Left (RL) rotation'],
        explanation: `An LR imbalance requires a left rotation on the child followed by a right rotation on the parent.`,
        difficulty: 3,
      },
      {
        question: `What is the worst-case search complexity of a degenerated Binary Search Tree?`,
        answer: `O(n) - degrading into a singly-linked list.`,
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        explanation: `When keys are inserted in sorted order without balancing, tree depth equals the number of nodes.`,
        difficulty: 1,
      }
    );
  } else if (tLower.includes('stack') || tLower.includes('queue')) {
    pool.push(
      {
        question: `Which traversal algorithm fundamentally uses a Queue (FIFO)?`,
        answer: `Breadth-First Search (BFS).`,
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra shortest path', 'Topological Sort with recursion'],
        explanation: `BFS explores neighbor nodes layer-by-layer, which is naturally ordered with a FIFO Queue.`,
        difficulty: 1,
      },
      {
        question: `What is the time complexity of push and pop operations on an array-backed Stack with dynamic resizing?`,
        answer: `O(1) amortized.`,
        options: ['O(1) strict worst-case', 'O(1) amortized', 'O(log n)', 'O(n)'],
        explanation: `While resizing takes O(n), it occurs infrequently enough that the amortized per-operation cost is O(1).`,
        difficulty: 2,
      }
    );
  } else if (tLower.includes('index') || tLower.includes('b+') || tLower.includes('b tree') || tLower.includes('dbms')) {
    pool.push(
      {
        question: `Why do relational databases prefer B+ Trees over B Trees for disk-based indexes?`,
        answer: `All records are kept in doubly-linked leaf nodes, enabling fast sequential range queries.`,
        options: [
          'B+ Trees require zero memory locks',
          'All records are kept in doubly-linked leaf nodes, enabling fast sequential range queries',
          'B+ Trees have lower memory consumption than binary search trees',
          'B Trees cannot store numeric keys',
        ],
        explanation: `Leaf chaining allows range scans without backtracking up through interior index nodes.`,
        difficulty: 2,
      },
      {
        question: `What does high fanout in a B+ Tree accomplish for storage systems?`,
        answer: `Minimizes disk seeks by keeping the tree shallow (height typically 3-4).`,
        options: [
          'Eliminates lock contention entirely',
          'Minimizes disk seeks by keeping the tree shallow (height typically 3-4)',
          'Guarantees linear search speed',
          'Removes the need for write-ahead logging',
        ],
        explanation: `Each node holds hundreds of keys, drastically reducing the number of disk page transfers per lookup.`,
        difficulty: 2,
      }
    );
  } else {
    pool.push(
      {
        question: `What is the core engineering purpose and asymptotic advantage of ${topic}?`,
        answer: `${topic} provides structured algorithmic bounds and predictable execution time under load.`,
        options: [
          'Optimizes cache locality and bounds worst-case execution',
          'Eliminates the need for input validation',
          'Replaces all existing standard library containers',
          'Guarantees O(1) space across all problem domains',
        ],
        explanation: `${topic} is designed in ${subject} to maintain invariants and bounded complexity.`,
        difficulty: 2,
      },
      {
        question: `Which trade-off is most characteristic when applying ${topic}?`,
        answer: `Balancing space complexity overhead against accelerated query/execution throughput.`,
        options: [
          'Network bandwidth versus battery consumption',
          'Balancing space complexity overhead against accelerated query/execution throughput',
          'Syntax verbosity versus compiler speed',
          'Strict sequential processing versus distributed batching',
        ],
        explanation: `Most data structures and algorithms trade auxiliary memory for reduced computational steps.`,
        difficulty: 2,
      },
      {
        question: `Under which condition does ${topic} encounter its worst-case edge scenario?`,
        answer: `Degenerate, highly skewed, or adversarial input patterns without adaptive rebalancing.`,
        options: [
          'Uniformly distributed random input',
          'Degenerate, highly skewed, or adversarial input patterns without adaptive rebalancing',
          'Zero-latency memory architecture',
          'Thread-safe lock-free reads',
        ],
        explanation: `Unbalanced inputs challenge structural invariants unless explicit self-balancing is applied.`,
        difficulty: 3,
      }
    );
  }

  return pool.slice(0, count);
}

/**
 * Generates flashcards using LLM when available, falling back to curated high-yield cards
 */
async function generateCardsWithLLM(topic, subject, count) {
  const apiKey = process.env.GEMINI_API_KEY;
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS, 10) || 15000;

  if (apiKey) {
    const prompt = `You are an expert academic tutor in Computer Science.
Generate exactly ${count} high-yield multiple-choice flashcards for university students studying:
Subject: "${subject}"
Topic: "${topic}"

OUTPUT REQUIREMENTS:
- You must return ONLY a valid JSON array of objects.
- Do NOT wrap in markdown, do not include preamble, do not include trailing text.
- Each object must have these exact keys:
  - "question": clear conceptual question (string, max 250 chars)
  - "answer": the correct answer string (string, max 200 chars)
  - "options": array of exactly 4 strings (including the correct answer)
  - "explanation": concise explanation of why the answer is correct (string, max 300 chars)
  - "difficulty": number 1, 2, or 3 (1=easy, 2=medium, 3=hard)

Example JSON format:
[
  {
    "question": "What is ...?",
    "answer": "Option A text",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "explanation": "Because ...",
    "difficulty": 2
  }
]`;

    const makeCall = async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1200,
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timer);
        return res;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    };

    let response = null;
    try {
      response = await makeCall();
      if (!response.ok && (response.status === 429 || response.status >= 500)) {
        // Retry once
        response = await makeCall();
      }
    } catch (e) {
      try {
        // Retry once on network error/timeout
        response = await makeCall();
      } catch (retryErr) {
        console.warn('Flashcard generation LLM retry failed, using curated cards:', retryErr.message);
      }
    }

    if (response && response.ok) {
      try {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json\s*|\s*```/gi, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validatedCards = [];
          for (const item of parsed.slice(0, count)) {
            if (
              item &&
              typeof item.question === 'string' &&
              item.question.trim().length > 0 &&
              typeof item.answer === 'string' &&
              item.answer.trim().length > 0 &&
              Array.isArray(item.options) &&
              item.options.length >= 2
            ) {
              validatedCards.push({
                question: item.question.trim().slice(0, 300),
                answer: item.answer.trim().slice(0, 300),
                options: item.options.map((o) => String(o).slice(0, 150)),
                explanation: (item.explanation || '').slice(0, 500),
                difficulty: [1, 2, 3].includes(item.difficulty) ? item.difficulty : 2,
              });
            }
          }

          if (validatedCards.length > 0) {
            return validatedCards;
          }
        }
      } catch (jsonErr) {
        console.warn('Failed to parse LLM flashcards JSON response, falling back to curated cards:', jsonErr.message);
      }
    }
  }

  // Fallback to curated cards
  return getCuratedCards(topic, subject, count);
}

/**
 * Executes a tool function on the backend with authorization and validation
 */
export async function executeTool(toolName, args = {}, userId = 'default_student_1') {
  // 1. Schema Validation
  const validation = validateToolArguments(toolName, args);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      details: validation.details,
    };
  }

  const sanitized = validation.data;

  // 2. Dispatch to Planner Repository / Store
  switch (toolName) {
    case 'get_today_plan': {
      const todayTasks = await getTodayTasks(userId);
      const missed = await getMissedTasks(userId);
      const exams = await getExams(userId, 14);

      return {
        success: true,
        todayTasks,
        missedTasksCount: missed.length,
        upcomingExams: exams,
        summary: `You have ${todayTasks.length} tasks scheduled today (${
          todayTasks.filter((t) => t.completed).length
        } completed). There are ${missed.length} overdue tasks, and your next exam is in ${
          exams[0]?.daysLeft ?? 'N/A'
        } days.`,
      };
    }

    case 'create_task': {
      const allSubjects = await getSubjects(userId);
      const matchedSubject =
        allSubjects.find(
          (s) => sanitized.subjectName && s.name.toLowerCase().includes(sanitized.subjectName.toLowerCase())
        ) || allSubjects[0];

      const newTask = await addTask(userId, {
        title: sanitized.title,
        subjectId: matchedSubject?.id || 'cs301',
        subjectName: matchedSubject?.name || sanitized.subjectName || 'General Study',
        durationHours: sanitized.durationHours,
        priority: sanitized.priority,
        dueDate: sanitized.dueDate,
        scheduledDate: new Date().toISOString().split('T')[0],
      });

      return {
        success: true,
        task: newTask,
        message: `Created task "${newTask.title}" under ${newTask.subjectName} for ${newTask.scheduledDate}.`,
      };
    }

    case 'reschedule_missed': {
      const result = await rescheduleOverdue(userId);
      return {
        success: true,
        rescheduledCount: result.rescheduledCount,
        tasks: result.tasks,
        message:
          result.rescheduledCount > 0
            ? `Successfully moved ${result.rescheduledCount} missed task(s) forward to today's schedule.`
            : 'No missed tasks found; your schedule is fully up to date!',
      };
    }

    case 'generate_flashcards': {
      const topic = sanitized.topic;
      const subject = sanitized.subject;
      const count = sanitized.count;

      // Real LLM-backed generator with schema validation and fallback
      const generatedRawCards = await generateCardsWithLLM(topic, subject, count);

      const savedCards = generatedRawCards.map((c, idx) => ({
        _id: `fc_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        subjectId: 'cs_dynamic',
        subjectName: subject,
        topicId: topic.toLowerCase().replace(/\s+/g, '_'),
        topicName: topic,
        question: c.question,
        answer: c.answer,
        options: c.options,
        explanation: c.explanation,
        lastResult: 'untested',
        difficulty: c.difficulty,
        createdAt: new Date(),
      }));

      // Save to memory store
      savedCards.forEach((c) => memoryFlashcards.push(c));

      // Save to MongoDB if connected
      if (getDBStatus().connected) {
        try {
          await FlashcardQuizModel.insertMany(savedCards);
        } catch (dbErr) {
          console.warn('Could not persist flashcards to MongoDB:', dbErr.message);
        }
      }

      return {
        success: true,
        count: savedCards.length,
        flashcards: savedCards,
        flashcard: savedCards[0],
        message: `Generated and saved ${savedCards.length} flashcard(s) on "${topic}".`,
      };
    }

    default:
      return {
        success: false,
        error: `Unknown tool function: ${toolName}`,
      };
  }
}
