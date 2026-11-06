import FlashcardQuizModel from '../models/FlashcardQuiz.js';

/**
 * POST /api/quiz/generate
 * Generates interactive quiz questions & flashcards on a requested topic
 */
export async function generateQuiz(req, res) {
  try {
    const { topic = 'General CS', subject = 'Computer Science', count = 3 } = req.body || {};
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const topicClean = String(topic).trim().slice(0, 100);
    const subjectClean = String(subject).trim().slice(0, 100);
    const validCount = Math.min(Math.max(parseInt(count, 10) || 3, 1), 10);

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

    const cardsToInsert = samplePool.slice(0, validCount).map((item) => ({
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
    }));

    const inserted = await FlashcardQuizModel.insertMany(cardsToInsert);
    const generatedCards = inserted.map((doc) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
      _id: doc._id.toString(),
    }));

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
    const { cardId, result } = req.body || {};
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!cardId || !['correct', 'incorrect'].includes(result)) {
      return res.status(400).json({ error: 'Valid cardId and result (correct/incorrect) are required.' });
    }

    const card = await FlashcardQuizModel.findOneAndUpdate(
      { _id: cardId, userId },
      {
        $set: {
          lastResult: result,
          lastAttemptedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ success: false, error: 'Flashcard not found.' });
    }

    return res.status(200).json({
      success: true,
      cardId,
      result,
      message: result === 'correct' ? '🎉 Great job! Marked as mastered.' : '📌 Added to your Weak Topics review list.',
      card: {
        ...card.toObject(),
        id: card._id.toString(),
        _id: card._id.toString(),
      },
    });
  } catch (error) {
    console.error('Quiz result recording error:', error);
    return res.status(500).json({ success: false, error: 'Could not record quiz result.' });
  }
}

/**
 * GET /api/quiz/flashcards
 * Returns all flashcards for study, filtered by user and optional topic/subject/status
 */
export async function getFlashcards(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { subjectId, topicId, status } = req.query || {};

    const query = { userId };
    if (subjectId) query.subjectId = subjectId;
    if (topicId) query.topicId = topicId;
    if (status) query.lastResult = status;

    const dbCards = await FlashcardQuizModel.find(query).sort({ createdAt: -1 }).lean();
    const cards = dbCards.map((c) => ({
      ...c,
      id: c._id.toString(),
      _id: c._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      count: cards.length,
      cards,
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return res.status(500).json({ success: false, error: 'Could not load flashcards.' });
  }
}

/**
 * GET /api/quiz/weak-topics
 * Weak-Topic Detection: calculates topics where student scored 'incorrect'
 */
export async function getWeakTopics(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const incorrectCards = await FlashcardQuizModel.find({
      userId,
      lastResult: 'incorrect',
    }).lean();

    const weakMap = {};
    incorrectCards.forEach((c) => {
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
      recommendation:
        weakTopics.length > 0
          ? `Review the following ${weakTopics.length} topic(s) with your AI Study Tutor before your next exam!`
          : '🎉 Excellent! No weak topics detected. Your retention is strong across all subjects.',
    });
  } catch (error) {
    console.error('Error fetching weak topics:', error);
    return res.status(500).json({ success: false, error: 'Could not calculate weak topics.' });
  }
}
