import StudySessionModel, { memoryStudySessions } from '../models/StudySession.js';
import { getDBStatus } from '../config/db.js';

/**
 * POST /api/sessions
 * Record a completed study/Pomodoro focus session (Member B)
 */
export async function createSession(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { taskId = null, subjectId = null, subjectName = '', durationMin = 25, notes = '', date } = req.body;

    const todayStr = date || new Date().toISOString().split('T')[0];

    const sessionObj = {
      _id: `sess_${Date.now()}`,
      id: `sess_${Date.now()}`,
      userId,
      taskId,
      subjectId,
      subjectName,
      durationMin: Number(durationMin) || 25,
      date: todayStr,
      notes,
      createdAt: new Date(),
    };

    memoryStudySessions.unshift(sessionObj);

    if (getDBStatus().connected) {
      try {
        const created = await StudySessionModel.create(sessionObj);
        sessionObj._id = created._id.toString();
        sessionObj.id = created._id.toString();
      } catch (err) {
        console.warn('MongoDB session save fallback:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Study session logged successfully!',
      session: sessionObj,
    });
  } catch (error) {
    console.error('Session logging error:', error);
    return res.status(500).json({ success: false, error: 'Could not log study session.' });
  }
}

/**
 * GET /api/sessions
 * Get sessions for the user with ?range=week | ?range=month (Member B)
 */
export async function getSessions(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { range = 'week' } = req.query;

    const daysBack = range === 'month' ? 30 : 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    let sessions = [];

    if (getDBStatus().connected) {
      try {
        const dbSessions = await StudySessionModel.find({
          userId,
          date: { $gte: cutoffStr },
        }).sort({ date: -1 }).lean();
        sessions = dbSessions.map(s => ({ ...s, id: s._id.toString() }));
      } catch (e) {}
    }

    if (sessions.length === 0) {
      sessions = memoryStudySessions.filter(s => s.userId === userId && s.date >= cutoffStr);
    }

    return res.status(200).json({
      success: true,
      count: sessions.length,
      range,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch study sessions.' });
  }
}
