import FlashcardQuizModel, { memoryFlashcards } from '../models/FlashcardQuiz.js';
import { getDBStatus } from '../config/db.js';

/**
 * POST /api/quiz/generate
 * Generates interactive quiz questions & flashcards on a requested topic
 */
export async function generateQuiz(req, res) {
  try {
    const { topic = 'General CS', subject = 'Computer Science', count = 3, userId = 'default_student_1' } = req.body;

    const topicClean = topic.trim();
    const subjectClean = subject.trim();

    // High yield question bank templates for intelligent local generation
    const samplePool = [
      {
        question: `What is the primary design purpose and asymptotic benefit of ${topicClean}?`,
        answer: `It provides optimized time bounds and prevents worst-case degradation through structured organization.`,
        options: [
          `Guarantees logarithmic operational bounds`,
          `Minimizes random memory accesses`,
          `Reduces disk seek bottlenecks in distributed workloads`,
          `All of the above depending on runtime constraints`,
        ],
        explanation: `${topicClean} is widely used in systems to balance throughput, latency, and memory locality.`,
        difficulty: 2,
      },
      {
        question: `In the context of ${subjectClean}, which algorithmic invariant must be maintained when modifying ${topicClean}?`,
        answer: `State consistency and structural invariant adherence.`,
        options: [
          `Strict FIFO ordering`,
          `Structural invariants and order properties`,
          `Unbounded heap allocation`,
          `Constant factor cache invalidation`,
        ],
        explanation: `Whenever structural transformations occur, invariants must be restored to prevent search and retrieval corruption.`,
        difficulty: 3,
      },
      {
        question: `Which scenario represents the worst-case edge condition for ${topicClean}?`,
        answer: `Degenerate unbalanced input sequences without self-correction mechanisms.`,
        options: [
          `Evenly distributed random keys`,
          `Degenerate monotonic input sequences`,
          `Empty cache with warm start`,
          `High-frequency read-heavy traffic`,
        ],
        explanation: `Monotonic inputs without rebalancing mechanisms lead to degraded linear time performance.`,
        difficulty: 1,
      },
    ];

    const generatedCards = samplePool.slice(0, count).map((item, idx) => ({
      _id: `card_${Date.now()}_${idx}`,
      userId,
      subjectId: 'cs_dynamic',
      subjectName: subjectClean,
      topicId: topicClean.toLowerCase().replace(/\s+/g, '_'),
      topicName: topicClean,
      question: item.question,
      answer: item.answer,
      options: item.options,
      explanation: item.explanation,
      lastResult: 'untested',
      difficulty: item.difficulty,
      createdAt: new Date(),
    }));

    // Add to memory
    generatedCards.forEach(c => memoryFlashcards.push(c));

    if (getDBStatus().connected) {
      try {
        await FlashcardQuizModel.insertMany(generatedCards);
      } catch (err) {
        console.warn('Could not save generated quiz to MongoDB:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      count: generatedCards.length,
      topic: topicClean,
      subject: subjectClean,
      cards: generatedCards,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ success: false, error: 'Could not generate quiz.' });
  }
}

/**
 * POST /api/quiz/result
 * Records user's answer result ('correct' | 'incorrect'), updating weak-topic tracking
 */
export async function recordQuizResult(req, res) {
  try {
    const { cardId, result, selectedOption, userId = 'default_student_1' } = req.body;

    if (!cardId || !['correct', 'incorrect'].includes(result)) {
      return res.status(400).json({ error: 'Valid cardId and result (correct/incorrect) are required.' });
    }

    // Update in memory store
    const card = memoryFlashcards.find(c => c._id === cardId);
    if (card) {
      card.lastResult = result;
      card.lastAttemptedAt = new Date();
    }

    if (getDBStatus().connected) {
      try {
        await FlashcardQuizModel.findByIdAndUpdate(cardId, {
          lastResult: result,
          lastAttemptedAt: new Date(),
        });
      } catch (e) {
        // silent
      }
    }

    return res.status(200).json({
      success: true,
      cardId,
      result,
      message: result === 'correct' ? '🎉 Great job! Marked as mastered.' : '📌 Added to your Weak Topics review list.',
      card,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not record quiz result.' });
  }
}

/**
 * GET /api/quiz/flashcards
 * Returns all flashcards for study, with optional topic/subject filter
 */
export async function getFlashcards(req, res) {
  try {
    const { subjectId, topicId, status } = req.query;
    let cards = [...memoryFlashcards];

    if (subjectId) {
      cards = cards.filter(c => c.subjectId === subjectId);
    }
    if (topicId) {
      cards = cards.filter(c => c.topicId === topicId);
    }
    if (status) {
      cards = cards.filter(c => c.lastResult === status);
    }

    return res.status(200).json({
      success: true,
      count: cards.length,
      cards,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not load flashcards.' });
  }
}

/**
 * GET /api/quiz/weak-topics
 * Weak-Topic Detection: calculates topics where student scored 'incorrect'
 */
export async function getWeakTopics(req, res) {
  try {
    const incorrectCards = memoryFlashcards.filter(c => c.lastResult === 'incorrect');

    // Group by subject and topic
    const weakMap = {};
    incorrectCards.forEach(c => {
      const key = `${c.subjectName} — ${c.topicName}`;
      if (!weakMap[key]) {
        weakMap[key] = {
          subjectName: c.subjectName,
          topicName: c.topicName,
          missedCount: 0,
          sampleQuestions: [],
        };
      }
      weakMap[key].missedCount += 1;
      weakMap[key].sampleQuestions.push(c.question);
    });

    const weakTopics = Object.values(weakMap);

    return res.status(200).json({
      success: true,
      totalWeakTopics: weakTopics.length,
      weakTopics,
      recommendation: weakTopics.length > 0
        ? `Review the following ${weakTopics.length} topic(s) with your AI Study Tutor before your next exam!`
        : '🎉 Excellent! No weak topics detected. Your retention is strong across all subjects.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not calculate weak topics.' });
  }
}
