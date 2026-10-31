import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import { mockSubjects } from '../models/mockPlannerStore.js';
import { getDBStatus } from '../config/db.js';

/**
 * GET /api/subjects
 * Retrieve all subjects with their associated topics for the user (Member B)
 */
export async function getSubjects(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';

    let subjects = [];

    if (getDBStatus().connected) {
      try {
        const dbSubjects = await SubjectModel.find({ userId }).sort({ examDate: 1 }).lean();
        const dbTopics = await TopicModel.find({ userId }).lean();

        subjects = dbSubjects.map(sub => ({
          id: sub._id.toString(),
          _id: sub._id.toString(),
          name: sub.name,
          code: sub.code || '',
          color: sub.color,
          examDate: sub.examDate ? sub.examDate.toISOString().split('T')[0] : '',
          topics: dbTopics
            .filter(t => t.subjectId === sub._id.toString() || t.subjectId === sub.code)
            .map(t => ({
              id: t._id.toString(),
              _id: t._id.toString(),
              name: t.name,
              difficulty: t.difficulty,
              estimatedHours: t.estimatedHours,
              status: t.status,
            })),
        }));
      } catch (err) {
        console.warn('MongoDB subjects query failed, falling back to memory store:', err.message);
      }
    }

    if (subjects.length === 0) {
      subjects = mockSubjects;
    }

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve subjects.' });
  }
}

/**
 * POST /api/subjects
 * Create a new academic subject with exam date and color (Member B)
 */
export async function createSubject(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { name, color = '#6366f1', examDate, code } = req.body;

    if (!name || !examDate) {
      return res.status(400).json({ success: false, error: 'Subject name and exam date are required.' });
    }

    const subId = `subj_${Date.now()}`;
    const newSubData = {
      id: subId,
      _id: subId,
      userId,
      name: name.trim(),
      code: code ? code.trim() : name.trim().slice(0, 6).toUpperCase(),
      color: color || '#6366f1',
      examDate: typeof examDate === 'string' ? examDate.split('T')[0] : examDate,
      topics: [],
    };

    // Save to memory store
    mockSubjects.push(newSubData);

    // Save to MongoDB if connected
    if (getDBStatus().connected) {
      try {
        const created = await SubjectModel.create({
          userId,
          name: newSubData.name,
          code: newSubData.code,
          color: newSubData.color,
          examDate: new Date(newSubData.examDate),
        });
        newSubData._id = created._id.toString();
        newSubData.id = created._id.toString();
      } catch (err) {
        console.warn('MongoDB subject create fallback:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully.',
      subject: newSubData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create subject.' });
  }
}

/**
 * PUT /api/subjects/:id
 * Update subject details (Member B)
 */
export async function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const { name, color, examDate, code } = req.body;

    const subject = mockSubjects.find(s => s.id === id || s._id === id);
    if (subject) {
      if (name) subject.name = name.trim();
      if (color) subject.color = color;
      if (examDate) subject.examDate = typeof examDate === 'string' ? examDate.split('T')[0] : examDate;
      if (code) subject.code = code.trim();
    }

    if (getDBStatus().connected) {
      try {
        await SubjectModel.findByIdAndUpdate(id, {
          ...(name && { name: name.trim() }),
          ...(color && { color }),
          ...(examDate && { examDate: new Date(examDate) }),
          ...(code && { code: code.trim() }),
        });
      } catch (err) {
        // silent
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      subject,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update subject.' });
  }
}

/**
 * DELETE /api/subjects/:id
 * Delete subject and associated topics (Member B)
 */
export async function deleteSubject(req, res) {
  try {
    const { id } = req.params;
    const index = mockSubjects.findIndex(s => s.id === id || s._id === id);
    if (index !== -1) {
      mockSubjects.splice(index, 1);
    }

    if (getDBStatus().connected) {
      try {
        await SubjectModel.findByIdAndDelete(id);
        await TopicModel.deleteMany({ subjectId: id });
      } catch (err) {
        // silent
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete subject.' });
  }
}

/**
 * GET /api/subjects/:id/topics
 * Retrieve topics for a given subject (Member B)
 */
export async function getTopicsForSubject(req, res) {
  try {
    const { id } = req.params;
    const subject = mockSubjects.find(s => s.id === id || s._id === id);

    let topics = subject?.topics || [];

    if (getDBStatus().connected) {
      try {
        const dbTopics = await TopicModel.find({ subjectId: id });
        if (dbTopics.length > 0) {
          topics = dbTopics.map(t => ({
            id: t._id.toString(),
            _id: t._id.toString(),
            name: t.name,
            difficulty: t.difficulty,
            estimatedHours: t.estimatedHours,
            status: t.status,
          }));
        }
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve topics.' });
  }
}

/**
 * POST /api/subjects/:id/topics
 * Add a topic to a subject (Member B)
 */
export async function createTopic(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { id: subjectId } = req.params;
    const { name, difficulty = 2, estimatedHours = 2, status = 'pending' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Topic name is required.' });
    }

    const topicId = `top_${Date.now()}`;
    const newTopic = {
      id: topicId,
      _id: topicId,
      userId,
      subjectId,
      name: name.trim(),
      difficulty: Number(difficulty) || 2,
      estimatedHours: Number(estimatedHours) || 2,
      status: ['pending', 'in-progress', 'in_progress', 'completed'].includes(status) ? status : 'pending',
    };

    const subject = mockSubjects.find(s => s.id === subjectId || s._id === subjectId);
    if (subject) {
      if (!subject.topics) subject.topics = [];
      subject.topics.push(newTopic);
    }

    if (getDBStatus().connected) {
      try {
        const created = await TopicModel.create({
          userId,
          subjectId,
          name: newTopic.name,
          difficulty: newTopic.difficulty,
          estimatedHours: newTopic.estimatedHours,
          status: newTopic.status.replace('-', '_'),
        });
        newTopic._id = created._id.toString();
        newTopic.id = created._id.toString();
      } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Topic created successfully.',
      topic: newTopic,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create topic.' });
  }
}

/**
 * PUT /api/topics/:id
 * Update topic status / difficulty / name (Member B)
 */
export async function updateTopic(req, res) {
  try {
    const { id } = req.params;
    const { name, difficulty, estimatedHours, status } = req.body;

    let updated = null;

    // Check in mockSubjects
    mockSubjects.forEach(s => {
      if (s.topics) {
        const t = s.topics.find(topic => topic.id === id || topic._id === id);
        if (t) {
          if (name) t.name = name.trim();
          if (difficulty) t.difficulty = Number(difficulty);
          if (estimatedHours) t.estimatedHours = Number(estimatedHours);
          if (status) t.status = status;
          updated = t;
        }
      }
    });

    if (getDBStatus().connected) {
      try {
        const doc = await TopicModel.findByIdAndUpdate(
          id,
          {
            ...(name && { name: name.trim() }),
            ...(difficulty && { difficulty: Number(difficulty) }),
            ...(estimatedHours && { estimatedHours: Number(estimatedHours) }),
            ...(status && { status: status.replace('-', '_') }),
          },
          { new: true }
        );
        if (doc) updated = doc;
      } catch (e) {}
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Topic not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Topic updated successfully.',
      topic: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update topic.' });
  }
}

/**
 * DELETE /api/topics/:id
 * Delete a topic (Member B)
 */
export async function deleteTopic(req, res) {
  try {
    const { id } = req.params;

    mockSubjects.forEach(s => {
      if (s.topics) {
        const idx = s.topics.findIndex(t => t.id === id || t._id === id);
        if (idx !== -1) s.topics.splice(idx, 1);
      }
    });

    if (getDBStatus().connected) {
      try {
        await TopicModel.findByIdAndDelete(id);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Topic deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete topic.' });
  }
}
