import request from 'supertest';
import app from '../app.js';
import FlashcardQuizModel from '../models/FlashcardQuiz.js';
import { createTestUser } from './testAuthHelper.js';

describe('Quiz & Flashcards Endpoints (/api/quiz)', () => {
  let authHeader;
  let testUserId;
  let testCard;

  beforeEach(async () => {
    const userObj = await createTestUser();
    authHeader = userObj.authHeader;
    testUserId = userObj.userId;

    // Seed one card for testing quiz results
    testCard = await FlashcardQuizModel.create({
      userId: testUserId,
      subjectId: 'cs_test',
      subjectName: 'Data Structures',
      topicId: 'trees',
      topicName: 'Binary Search Trees',
      question: 'What is the time complexity of searching in a balanced BST?',
      answer: 'O(log n)',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      explanation: 'Balanced BST halves search space at each level.',
      difficulty: 'medium',
      lastResult: 'untested',
    });
  });

  describe('POST /api/quiz/generate', () => {
    it('generates interactive quiz questions for a topic', async () => {
      const res = await request(app)
        .post('/api/quiz/generate')
        .set('Authorization', authHeader)
        .send({
          topic: 'Binary Search Trees',
          subject: 'Data Structures',
          count: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.cards.length).toBe(2);
      expect(res.body.cards[0].question).toBeDefined();
      expect(res.body.cards[0].options.length).toBeGreaterThanOrEqual(2);
    });

    it('caps generated quiz count at 10', async () => {
      const res = await request(app)
        .post('/api/quiz/generate')
        .set('Authorization', authHeader)
        .send({
          topic: 'Virtual Memory',
          count: 25,
        });

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(10);
    });
  });

  describe('POST /api/quiz/result', () => {
    it('returns 400 when cardId or valid result is missing', async () => {
      const res = await request(app)
        .post('/api/quiz/result')
        .set('Authorization', authHeader)
        .send({ cardId: testCard._id.toString(), result: 'maybe' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Valid cardId and result/i);
    });

    it('records correct answer and updates database record', async () => {
      const res = await request(app)
        .post('/api/quiz/result')
        .set('Authorization', authHeader)
        .send({
          cardId: testCard._id.toString(),
          result: 'correct',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toBe('correct');

      const updated = await FlashcardQuizModel.findById(testCard._id);
      expect(updated.lastResult).toBe('correct');
    });

    it('records incorrect answer and updates weak topic status', async () => {
      const res = await request(app)
        .post('/api/quiz/result')
        .set('Authorization', authHeader)
        .send({
          cardId: testCard._id.toString(),
          result: 'incorrect',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toBe('incorrect');

      const updated = await FlashcardQuizModel.findById(testCard._id);
      expect(updated.lastResult).toBe('incorrect');
    });
  });

  describe('GET /api/quiz/flashcards', () => {
    it('returns all flashcards for authenticated user', async () => {
      const res = await request(app)
        .get('/api/quiz/flashcards')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.cards)).toBe(true);
      expect(res.body.cards.length).toBeGreaterThan(0);
    });

    it('filters flashcards by status', async () => {
      await FlashcardQuizModel.findByIdAndUpdate(testCard._id, { lastResult: 'incorrect' });

      const res = await request(app)
        .get('/api/quiz/flashcards?status=incorrect')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cards.every((c) => c.lastResult === 'incorrect')).toBe(true);
    });
  });

  describe('GET /api/quiz/weak-topics', () => {
    it('calculates and groups weak topics for the user', async () => {
      await FlashcardQuizModel.findByIdAndUpdate(testCard._id, { lastResult: 'incorrect' });

      const res = await request(app)
        .get('/api/quiz/weak-topics')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalWeakTopics).toBeDefined();
      expect(Array.isArray(res.body.weakTopics)).toBe(true);
      expect(res.body.weakTopics.length).toBeGreaterThan(0);
      expect(res.body.weakTopics[0].subjectName).toBe('Data Structures');
    });
  });
});
