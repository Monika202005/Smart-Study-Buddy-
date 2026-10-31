// In-memory Planner Data Store
// Provides live student context (Subjects, Exams, Tasks, Topics) for Member 1's Chatbot & Tools.
// When Member B completes the MongoDB Subject & Task models, they plug directly into these hooks.

export const mockUser = {
  _id: 'default_student_1',
  name: 'Monika Sharma',
  email: 'monika@studybuddy.dev',
  dailyHours: 4,
  theme: 'dark',
};

export let mockSubjects = [
  {
    id: 'cs301',
    name: 'Data Structures & Algorithms',
    color: '#6366f1',
    examDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in 5 days
    topics: [
      { id: 't1', name: 'Binary Search Trees & AVL', difficulty: 2, estimatedHours: 3, status: 'in-progress' },
      { id: 't2', name: 'Graph Traversal (BFS/DFS)', difficulty: 2, estimatedHours: 3, status: 'completed' },
      { id: 't3', name: 'Dynamic Programming & Memoization', difficulty: 3, estimatedHours: 5, status: 'pending' },
    ],
  },
  {
    id: 'cs304',
    name: 'Database Management Systems',
    color: '#10b981',
    examDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in 12 days
    topics: [
      { id: 't4', name: 'B+ Tree Indexing', difficulty: 2, estimatedHours: 2, status: 'pending' },
      { id: 't5', name: 'ACID & Transaction Concurrency', difficulty: 2, estimatedHours: 3, status: 'completed' },
      { id: 't6', name: 'SQL Query Optimization', difficulty: 2, estimatedHours: 2, status: 'pending' },
    ],
  },
  {
    id: 'cs308',
    name: 'Operating Systems',
    color: '#f59e0b',
    examDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in 19 days
    topics: [
      { id: 't7', name: 'Virtual Memory & Paging', difficulty: 3, estimatedHours: 4, status: 'in-progress' },
      { id: 't8', name: 'CPU Scheduling Algorithms', difficulty: 1, estimatedHours: 2, status: 'completed' },
      { id: 't9', name: 'Deadlock Detection & Prevention', difficulty: 2, estimatedHours: 3, status: 'pending' },
    ],
  },
];

export let mockTasks = [
  {
    id: 'task_1',
    userId: 'default_student_1',
    subjectId: 'cs301',
    subjectName: 'Data Structures & Algorithms',
    title: 'Implement AVL Tree rotation & rebalancing',
    type: 'study',
    dueDate: new Date().toISOString().split('T')[0], // today
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'high',
    completed: false,
    durationHours: 2,
  },
  {
    id: 'task_2',
    userId: 'default_student_1',
    subjectId: 'cs301',
    subjectName: 'Data Structures & Algorithms',
    title: 'Solve 3 Graph traversal practice problems on LeetCode',
    type: 'assignment',
    dueDate: new Date().toISOString().split('T')[0], // today
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    completed: true,
    durationHours: 1.5,
  },
  {
    id: 'task_3',
    userId: 'default_student_1',
    subjectId: 'cs304',
    subjectName: 'Database Management Systems',
    title: 'Read B+ Tree leaf node splitting and range scans',
    type: 'study',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    completed: false,
    durationHours: 2,
  },
  {
    id: 'task_4',
    userId: 'default_student_1',
    subjectId: 'cs308',
    subjectName: 'Operating Systems',
    title: 'Review Page Replacement algorithms (FIFO, LRU, Optimal)',
    type: 'study',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // missed/yesterday
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    completed: false,
    durationHours: 1.5,
  },
];

export function getTodayTasks() {
  const todayStr = new Date().toISOString().split('T')[0];
  return mockTasks.filter(t => t.scheduledDate === todayStr);
}

export function getMissedTasks() {
  const todayStr = new Date().toISOString().split('T')[0];
  return mockTasks.filter(t => !t.completed && t.scheduledDate < todayStr);
}

export function getExamsNext14Days() {
  const today = new Date();
  const limit = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  return mockSubjects
    .filter(s => {
      const exam = new Date(s.examDate);
      return exam >= today && exam <= limit;
    })
    .map(s => {
      const daysLeft = Math.ceil((new Date(s.examDate) - today) / (1000 * 60 * 60 * 24));
      return {
        subject: s.name,
        examDate: s.examDate,
        daysLeft,
      };
    });
}

export function addTask(taskData) {
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: taskData.userId || 'default_student_1',
    subjectId: taskData.subjectId || 'cs301',
    subjectName: taskData.subjectName || 'General Study',
    title: taskData.title,
    type: taskData.type || 'study',
    dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
    scheduledDate: taskData.scheduledDate || new Date().toISOString().split('T')[0],
    priority: taskData.priority || 'medium',
    completed: false,
    durationHours: taskData.durationHours || 1.5,
  };
  mockTasks.unshift(newTask);
  return newTask;
}

export function rescheduleOverdueTasks() {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const missed = getMissedTasks();
  
  missed.forEach(t => {
    t.scheduledDate = todayStr; // roll over to today or tomorrow
    t.dueDate = tomorrowStr;
  });

  return {
    rescheduledCount: missed.length,
    tasks: missed,
  };
}
