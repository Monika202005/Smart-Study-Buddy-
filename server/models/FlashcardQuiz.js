import mongoose from 'mongoose';

const flashcardQuizSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subjectId: {
      type: String,
      default: 'cs301',
    },
    subjectName: {
      type: String,
      default: 'Data Structures & Algorithms',
    },
    topicId: {
      type: String,
      default: 'trees',
    },
    topicName: {
      type: String,
      default: 'Binary Search Trees & AVL Trees',
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      default: '',
    },
    lastResult: {
      type: String,
      enum: ['correct', 'incorrect', 'untested'],
      default: 'untested',
    },
    difficulty: {
      type: Number,
      enum: [1, 2, 3],
      default: 2,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Built-in seed flashcards and quiz questions
export const memoryFlashcards = [
  {
    _id: 'card_1',
    userId: 'default_student_1',
    subjectId: 'cs301',
    subjectName: 'Data Structures & Algorithms',
    topicId: 'trees',
    topicName: 'Binary Search Trees',
    question: 'What is the worst-case time complexity of searching in an unbalanced Binary Search Tree?',
    answer: 'O(n) - When the tree degenerates into a linear linked list.',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    explanation: 'If elements are inserted in sorted order without self-balancing, the BST becomes a skewed tree, resulting in linear O(n) search time.',
    lastResult: 'incorrect', // flagged as weak topic for demonstration
    difficulty: 2,
    createdAt: new Date(),
  },
  {
    _id: 'card_2',
    userId: 'default_student_1',
    subjectId: 'cs301',
    subjectName: 'Data Structures & Algorithms',
    topicId: 'trees',
    topicName: 'AVL Trees',
    question: 'What is the balance factor condition for any node in an AVL tree to remain valid?',
    answer: 'The balance factor (Height(left) - Height(right)) must be -1, 0, or +1.',
    options: ['Between -2 and +2', '-1, 0, or +1', 'Strictly 0', 'Greater than or equal to 1'],
    explanation: 'An AVL tree strictly requires that for every node, the height difference between left and right subtrees is at most 1.',
    lastResult: 'untested',
    difficulty: 2,
    createdAt: new Date(),
  },
  {
    _id: 'card_3',
    userId: 'default_student_1',
    subjectId: 'cs304',
    subjectName: 'Database Management Systems',
    topicId: 'indexing',
    topicName: 'B+ Tree Indexing',
    question: 'Why are B+ Trees preferred over B Trees for disk-based database indexes?',
    answer: 'All data records are stored in the leaf nodes, which are linked together for fast sequential range queries.',
    options: [
      'They have shorter heights than B trees',
      'Leaf nodes contain all records and are linked sequentially for fast range scans',
      'They require zero disk seeks',
      'They do not require rebalancing'
    ],
    explanation: 'Sequential leaf linking allows DBMS to perform range scans (e.g. BETWEEN 10 AND 50) without traversing internal nodes multiple times.',
    lastResult: 'correct',
    difficulty: 3,
    createdAt: new Date(),
  },
  {
    _id: 'card_4',
    userId: 'default_student_1',
    subjectId: 'cs304',
    subjectName: 'Database Management Systems',
    topicId: 'transactions',
    topicName: 'ACID Properties',
    question: 'Which ACID property guarantees that database changes persist even in the event of a system crash?',
    answer: 'Durability',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    explanation: 'Durability ensures that once a transaction has committed, its updates survive crashes via Write-Ahead Logging (WAL).',
    lastResult: 'correct',
    difficulty: 1,
    createdAt: new Date(),
  },
  {
    _id: 'card_5',
    userId: 'default_student_1',
    subjectId: 'cs308',
    subjectName: 'Operating Systems',
    topicId: 'memory',
    topicName: 'Virtual Memory & Thrashing',
    question: 'What phenomenon occurs when an OS spends more time swapping pages in and out than executing instructions?',
    answer: 'Thrashing',
    options: ['Paging storm', 'Thrashing', 'Deadlock', 'Starvation'],
    explanation: 'Thrashing occurs when the system does not have enough physical memory frames to hold the working sets of active processes.',
    lastResult: 'incorrect', // flagged as weak topic for demonstration
    difficulty: 2,
    createdAt: new Date(),
  },
];

let FlashcardQuizModel;
try {
  FlashcardQuizModel = mongoose.model('FlashcardQuiz', flashcardQuizSchema);
} catch (e) {
  FlashcardQuizModel = mongoose.models.FlashcardQuiz;
}

export default FlashcardQuizModel;
