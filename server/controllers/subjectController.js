import SubjectModel from '../models/Subject.js';
import TopicModel from '../models/Topic.js';
import TaskModel from '../models/Task.js';
import StudySessionModel from '../models/StudySession.js';

/**
 * GET /api/subjects
 * Retrieve all subjects with their associated topics for the authenticated user
 */
export async function getSubjects(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [dbSubjects, dbTopics] = await Promise.all([
      SubjectModel.find({ userId }).sort({ examDate: 1 }).lean(),
      TopicModel.find({ userId }).lean(),
    ]);

    const subjects = dbSubjects.map((sub) => {
      const subIdStr = sub._id.toString();
      return {
        id: subIdStr,
        _id: subIdStr,
        userId: sub.userId,
        name: sub.name,
        code: sub.code || '',
        color: sub.color,
        examDate: sub.examDate ? new Date(sub.examDate).toISOString().split('T')[0] : '',
        topics: dbTopics
          .filter((t) => t.subjectId === subIdStr || (sub.code && t.subjectId === sub.code))
          .map((t) => ({
            id: t._id.toString(),
            _id: t._id.toString(),
            subjectId: t.subjectId,
            name: t.name,
            difficulty: t.difficulty,
            estimatedHours: t.estimatedHours,
            status: t.status,
          })),
      };
    });

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
 * Create a new academic subject with exam date and color
 */
export async function createSubject(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { name, color = '#6366f1', examDate, code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Subject name is required.' });
    }
    let parsedExamDate = null;
    if (examDate) {
      parsedExamDate = new Date(examDate);
      if (isNaN(parsedExamDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid exam date format.' });
      }
    }

    const created = await SubjectModel.create({
      userId,
      name: name.trim(),
      code: code ? code.trim() : name.trim().slice(0, 6).toUpperCase(),
      color: color || '#6366f1',
      examDate: parsedExamDate,
    });

    const subObj = created.toObject();
    const result = {
      ...subObj,
      id: created._id.toString(),
      _id: created._id.toString(),
      examDate: parsedExamDate ? parsedExamDate.toISOString().split('T')[0] : '',
      topics: [],
    };

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully.',
      subject: result,
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    return res.status(500).json({ success: false, error: 'Failed to create subject.' });
  }
}

/**
 * PUT /api/subjects/:id
 * Update subject details (scoped by userId)
 */
export async function updateSubject(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { name, color, examDate, code } = req.body;

    const subject = await SubjectModel.findOne({ _id: id, userId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    if (name) subject.name = name.trim();
    if (color) subject.color = color;
    if (code !== undefined) subject.code = code.trim();
    if (examDate) {
      const parsed = new Date(examDate);
      if (!isNaN(parsed.getTime())) subject.examDate = parsed;
    }

    await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      subject: {
        id: subject._id.toString(),
        _id: subject._id.toString(),
        name: subject.name,
        code: subject.code,
        color: subject.color,
        examDate: subject.examDate ? new Date(subject.examDate).toISOString().split('T')[0] : '',
      },
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return res.status(500).json({ success: false, error: 'Failed to update subject.' });
  }
}

/**
 * DELETE /api/subjects/:id
 * Delete subject and cascade delete associated topics, tasks, and sessions
 */
export async function deleteSubject(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const subject = await SubjectModel.findOneAndDelete({ _id: id, userId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    // Cascade deletion
    await Promise.all([
      TopicModel.deleteMany({ subjectId: id, userId }),
      TaskModel.deleteMany({ subjectId: id, userId }),
      StudySessionModel.deleteMany({ subjectId: id, userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Subject and associated syllabus/tasks deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete subject.' });
  }
}

/**
 * GET /api/subjects/:id/topics
 * Retrieve topics for a given subject (scoped by userId)
 */
export async function getTopicsForSubject(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id: subjectId } = req.params;

    const subject = await SubjectModel.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    const dbTopics = await TopicModel.find({ subjectId, userId }).lean();
    const topics = dbTopics.map((t) => ({
      id: t._id.toString(),
      _id: t._id.toString(),
      subjectId: t.subjectId,
      name: t.name,
      difficulty: t.difficulty,
      estimatedHours: t.estimatedHours,
      status: t.status,
    }));

    return res.status(200).json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    console.error('Error retrieving topics:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve topics.' });
  }
}

/**
 * POST /api/subjects/:id/topics
 * Add a topic to a subject (scoped by userId)
 */
export async function createTopic(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id: subjectId } = req.params;
    const { name, difficulty = 2, estimatedHours = 2, status = 'pending' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Topic name is required.' });
    }

    const subject = await SubjectModel.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    const validStatus = ['pending', 'in_progress', 'completed'].includes(status)
      ? status
      : status === 'in-progress'
      ? 'in_progress'
      : 'pending';

    const created = await TopicModel.create({
      userId,
      subjectId,
      name: name.trim(),
      difficulty: Number(difficulty) || 2,
      estimatedHours: Math.min(Math.max(Number(estimatedHours) || 2, 0.5), 20),
      status: validStatus,
    });

    const result = {
      ...created.toObject(),
      id: created._id.toString(),
      _id: created._id.toString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Topic created successfully.',
      topic: result,
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    return res.status(500).json({ success: false, error: 'Failed to create topic.' });
  }
}

/**
 * PUT /api/topics/:id
 * Update topic status / difficulty / name (scoped by userId)
 */
export async function updateTopic(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { name, difficulty, estimatedHours, status } = req.body;

    const topic = await TopicModel.findOne({ _id: id, userId });
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found.' });
    }

    if (name) topic.name = name.trim();
    if (difficulty !== undefined) topic.difficulty = Number(difficulty);
    if (estimatedHours !== undefined) topic.estimatedHours = Number(estimatedHours);
    if (status) {
      const normStatus = status === 'in-progress' ? 'in_progress' : status;
      if (['pending', 'in_progress', 'completed'].includes(normStatus)) {
        topic.status = normStatus;
      }
    }

    await topic.save();

    return res.status(200).json({
      success: true,
      message: 'Topic updated successfully.',
      topic: {
        ...topic.toObject(),
        id: topic._id.toString(),
        _id: topic._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return res.status(500).json({ success: false, error: 'Failed to update topic.' });
  }
}

/**
 * DELETE /api/topics/:id
 * Delete a topic (scoped by userId)
 */
export async function deleteTopic(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const topic = await TopicModel.findOneAndDelete({ _id: id, userId });
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found.' });
    }

    // Cascade delete any task specifically linked to this topic
    await TaskModel.deleteMany({ topicId: id, userId });

    return res.status(200).json({
      success: true,
      message: 'Topic deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete topic.' });
  }
}
