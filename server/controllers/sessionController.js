import StudySessionModel from '../models/StudySession.js';

/**
 * POST /api/sessions
 * Record a completed study/Pomodoro focus session
 */
export async function createSession(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { taskId = null, subjectId = null, subjectName = '', durationMin = 25, notes = '', date } = req.body;

    const todayStr = date || new Date().toISOString().split('T')[0];

    const created = await StudySessionModel.create({
      userId,
      taskId: taskId || null,
      subjectId: subjectId || null,
      subjectName: subjectName || '',
      durationMin: Math.max(Number(durationMin) || 1, 1),
      date: todayStr,
      notes: notes ? String(notes).slice(0, 500) : '',
    });

    const result = {
      ...created.toObject(),
      id: created._id.toString(),
      _id: created._id.toString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Study session logged successfully!',
      session: result,
    });
  } catch (error) {
    console.error('Session logging error:', error);
    return res.status(500).json({ success: false, error: 'Could not log study session.' });
  }
}

/**
 * GET /api/sessions
 * Get sessions for the user with ?range=week | ?range=month
 */
export async function getSessions(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { range = 'week' } = req.query;
    const daysBack = range === 'month' ? 30 : 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const dbSessions = await StudySessionModel.find({
      userId,
      date: { $gte: cutoffStr },
    })
      .sort({ date: -1 })
      .lean();

    const sessions = dbSessions.map((s) => ({
      ...s,
      id: s._id.toString(),
      _id: s._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      count: sessions.length,
      range,
      sessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ success: false, error: 'Could not fetch study sessions.' });
  }
}
