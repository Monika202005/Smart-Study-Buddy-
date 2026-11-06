import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import UserModel from '../models/User.js';
import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import TaskModel from '../models/Task.js';
import StudySessionModel from '../models/StudySession.js';
import FlashcardQuizModel from '../models/FlashcardQuiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment or server/.env. Aborting seed.');
  process.exit(1);
}

const isReset = process.argv.includes('--reset');

async function seedDatabase() {
  console.log('🌱 --- StudyBuddy Database Seeder ---');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas.');

    const existingUsers = await UserModel.countDocuments();
    if (existingUsers > 0 && !isReset) {
      console.log(`⚠️  Existing data detected (${existingUsers} user(s) found).`);
      console.log('   To overwrite and re-seed, run with the explicit --reset flag:');
      console.log('   npm run seed -- --reset');
      console.log('🛑 Aborting to prevent accidental data loss.');
      await mongoose.disconnect();
      process.exit(0);
    }

    if (isReset) {
      console.log('🧹 --reset flag detected: clearing previous demo seed data...');
      await UserModel.deleteMany({ email: 'student@studybuddy.dev' });
      // We only clean data belonging to our seed user or demo collections
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Demo User
    let user = await UserModel.findOne({ email: 'student@studybuddy.dev' });
    if (!user) {
      user = await UserModel.create({
        name: 'Alex Chen',
        email: 'student@studybuddy.dev',
        passwordHash,
        dailyHours: 4,
        theme: 'dark',
      });
      console.log(`👤 Created Demo User: ${user.name} (${user.email})`);
    } else {
      console.log(`👤 Using existing Demo User: ${user.name} (${user.email})`);
    }

    const userId = user._id.toString();

    // Clean existing user data for a fresh seed
    await Promise.all([
      SubjectModel.deleteMany({ userId }),
      TopicModel.deleteMany({ userId }),
      TaskModel.deleteMany({ userId }),
      StudySessionModel.deleteMany({ userId }),
      FlashcardQuizModel.deleteMany({ userId }),
    ]);

    // Dates calculation helper
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const exam1Date = new Date(now.getTime() + 6 * 86400000);
    const exam2Date = new Date(now.getTime() + 12 * 86400000);
    const exam3Date = new Date(now.getTime() + 18 * 86400000);

    // 2. Create 3 Academic Subjects
    const subjects = await SubjectModel.create([
      {
        userId,
        name: 'Data Structures & Algorithms',
        code: 'CS301',
        color: '#6366f1',
        examDate: exam1Date,
      },
      {
        userId,
        name: 'Database Management Systems',
        code: 'CS304',
        color: '#10b981',
        examDate: exam2Date,
      },
      {
        userId,
        name: 'Operating Systems',
        code: 'CS302',
        color: '#f59e0b',
        examDate: exam3Date,
      },
    ]);
    console.log(`📚 Created 3 Subjects: ${subjects.map((s) => s.name).join(', ')}`);

    // 3. Create Syllabus Topics with Difficulty (1-3) & Hours
    const topics = await TopicModel.create([
      // DSA
      {
        userId,
        subjectId: subjects[0]._id.toString(),
        name: 'AVL Tree Rotations & Balancing',
        difficulty: 3,
        estimatedHours: 3,
        status: 'in_progress',
      },
      {
        userId,
        subjectId: subjects[0]._id.toString(),
        name: 'Graph Traversals (BFS & DFS)',
        difficulty: 2,
        estimatedHours: 2.5,
        status: 'completed',
      },
      {
        userId,
        subjectId: subjects[0]._id.toString(),
        name: 'Dynamic Programming (Memoization vs Tabulation)',
        difficulty: 3,
        estimatedHours: 4,
        status: 'pending',
      },
      // DBMS
      {
        userId,
        subjectId: subjects[1]._id.toString(),
        name: 'B+ Tree Indexing & Range Queries',
        difficulty: 3,
        estimatedHours: 3,
        status: 'in_progress',
      },
      {
        userId,
        subjectId: subjects[1]._id.toString(),
        name: 'ACID Transactions & Isolation Levels',
        difficulty: 2,
        estimatedHours: 2,
        status: 'completed',
      },
      // OS
      {
        userId,
        subjectId: subjects[2]._id.toString(),
        name: 'Virtual Memory & Thrashing',
        difficulty: 3,
        estimatedHours: 3,
        status: 'pending',
      },
      {
        userId,
        subjectId: subjects[2]._id.toString(),
        name: 'Process Synchronization & Semaphores',
        difficulty: 3,
        estimatedHours: 3.5,
        status: 'pending',
      },
    ]);
    console.log(`📋 Created ${topics.length} Syllabus Topics`);

    // 4. Create Realistic Study Tasks
    const tasks = await TaskModel.create([
      // Completed yesterday
      {
        userId,
        subjectId: subjects[0]._id.toString(),
        subjectName: subjects[0].name,
        title: 'Implement Queue using Stacks and Linked List',
        durationHours: 1.5,
        priority: 'medium',
        dueDate: yesterdayStr,
        scheduledDate: yesterdayStr,
        completed: true,
        completedAt: yesterday,
      },
      // Overdue yesterday (for testing reschedule missed)
      {
        userId,
        subjectId: subjects[0]._id.toString(),
        subjectName: subjects[0].name,
        title: 'Review AVL Tree Balance Factor Calculations',
        durationHours: 2,
        priority: 'high',
        dueDate: yesterdayStr,
        scheduledDate: yesterdayStr,
        completed: false,
      },
      // Today task 1
      {
        userId,
        subjectId: subjects[0]._id.toString(),
        subjectName: subjects[0].name,
        title: 'Solve LeetCode Graph Traversal (BFS/DFS) Problems',
        durationHours: 2,
        priority: 'high',
        dueDate: todayStr,
        scheduledDate: todayStr,
        completed: false,
      },
      // Today task 2
      {
        userId,
        subjectId: subjects[1]._id.toString(),
        subjectName: subjects[1].name,
        title: 'Read B+ Tree Leaf Node Range Query Chapter',
        durationHours: 1.5,
        priority: 'medium',
        dueDate: todayStr,
        scheduledDate: todayStr,
        completed: false,
      },
      // Tomorrow task
      {
        userId,
        subjectId: subjects[2]._id.toString(),
        subjectName: subjects[2].name,
        title: 'Virtual Memory Working Set & Thrashing Diagrams',
        durationHours: 2,
        priority: 'medium',
        dueDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
        scheduledDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
        completed: false,
      },
    ]);
    console.log(`📅 Created ${tasks.length} Study Tasks (1 completed, 1 overdue, 2 today, 1 tomorrow)`);

    // 5. Create Study Session (for real analytics tracking)
    await StudySessionModel.create({
      userId,
      subjectId: subjects[0]._id.toString(),
      subjectName: subjects[0].name,
      durationMin: 45,
      date: yesterdayStr,
      notes: 'Completed queue and stack review session with Pomodoro timer.',
    });
    console.log(`⏱️  Created 1 Completed Study Session (45 mins)`);

    // 6. Create High-Yield Flashcards
    const flashcards = await FlashcardQuizModel.create([
      {
        userId,
        subject: 'Data Structures & Algorithms',
        topic: 'AVL Trees',
        question: 'What is the maximum allowed balance factor for any node in an AVL Tree?',
        answer: 'The balance factor must be -1, 0, or +1.',
        options: ['Strictly 0', '-1, 0, or +1', 'Between -2 and +2', 'Depends on tree depth'],
        explanation: 'AVL trees maintain O(log n) search height by rebalancing whenever |Height(left) - Height(right)| exceeds 1.',
        difficulty: 2,
        timesReviewed: 1,
        correctCount: 1,
        status: 'mastered',
      },
      {
        userId,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        question: 'What is the worst-case time complexity of searching an unbalanced BST?',
        answer: 'O(n) - degrading into a singly-linked list.',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        explanation: 'When keys are inserted in strictly ascending order, the BST degenerates into a linear chain.',
        difficulty: 1,
        timesReviewed: 2,
        correctCount: 0,
        status: 'weak',
      },
      {
        userId,
        subject: 'Database Management Systems',
        topic: 'B+ Tree Indexing',
        question: 'Why do relational databases prefer B+ Trees over B Trees for disk-based indexes?',
        answer: 'All records are kept in doubly-linked leaf nodes, enabling fast sequential range queries.',
        options: [
          'B+ Trees require zero memory locks',
          'All records are kept in doubly-linked leaf nodes, enabling fast sequential range queries',
          'B+ Trees have lower memory consumption than binary search trees',
          'B Trees cannot store numeric keys',
        ],
        explanation: 'In B+ trees, leaf nodes form a linked list, allowing range scans without traversing internal nodes.',
        difficulty: 3,
        timesReviewed: 0,
        correctCount: 0,
        status: 'unseen',
      },
    ]);
    console.log(`🗂️  Created ${flashcards.length} Flashcards (including 1 weak topic for active recall)`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Account Credentials:');
    console.log('Email    : student@studybuddy.dev');
    console.log('Password : password123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder encountered an error:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedDatabase();
