import request from 'supertest';
import app from '../app.js';
import { memoryFlashcards } from '../models/FlashcardQuiz.js';

describe('Quiz & Flashcards Endpoints (/api/quiz)', () => {
  describe('POST /api/quiz/generate', () => {
    it('generates interactive quiz questions for a topic', async () => {
      const res = await request(app)
        .post('/api/quiz/generate')
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
        .send({ cardId: 'card_1', result: 'maybe' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Valid cardId and result/i);
    });

    it('records correct answer and updates memory record', async () => {
      // Find a card in memory
      const targetCard = memoryFlashcards[0];
      const res = await request(app)
        .post('/api/quiz/result')
        .send({
          cardId: targetCard._id,
          result: 'correct',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toBe('correct');
      expect(targetCard.lastResult).toBe('correct');
    });

    it('records incorrect answer and updates weak topic status', async () => {
      const targetCard = memoryFlashcards[0];
      const res = await request(app)
        .post('/api/quiz/result')
        .send({
          cardId: targetCard._id,
          result: 'incorrect',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toBe('incorrect');
      expect(targetCard.lastResult).toBe('incorrect');
    });
  });

  describe('GET /api/quiz/flashcards', () => {
    it('returns all flashcards for authenticated user', async () => {
      const res = await request(app).get('/api/quiz/flashcards');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.cards)).toBe(true);
      expect(res.body.cards.length).toBeGreaterThan(0);
    });

    it('filters flashcards by status', async () => {
      const res = await request(app).get('/api/quiz/flashcards?status=incorrect');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cards.every((c) => c.lastResult === 'incorrect')).toBe(true);
    });
  });

  describe('GET /api/quiz/weak-topics', () => {
    it('calculates and groups weak topics for the user', async () => {
      const res = await request(app).get('/api/quiz/weak-topics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalWeakTopics).toBeDefined();
      expect(Array.isArray(res.body.weakTopics)).toBe(true);
      if (res.body.weakTopics.length > 0) {
        expect(res.body.weakTopics[0].subjectName).toBeDefined();
        expect(res.body.weakTopics[0].missedCount).toBeGreaterThanOrEqual(1);
      }
    });
  });
});

