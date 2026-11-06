import TaskModel from '../models/Task.js';
import SubjectModel from '../models/Subject.js';

/**
 * GET /api/tasks
 * Fetch tasks with optional filters: ?date=YYYY-MM-DD, ?completed=true|false, ?subjectId=xyz
 */
export async function getTasks(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { date, completed, subjectId } = req.query;

    const query = { userId };
    if (date) query.scheduledDate = date;
    if (completed !== undefined) query.completed = completed === 'true';
    if (subjectId) query.subjectId = subjectId;

    const dbTasks = await TaskModel.find(query).sort({ scheduledDate: 1, priority: -1 }).lean();
    const tasks = dbTasks.map((t) => ({
      ...t,
      id: t._id.toString(),
      _id: t._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve tasks.' });
  }
}

/**
 * POST /api/tasks
 * Create a new task (scoped by userId)
 */
export async function createTask(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      title,
      subjectId,
      subjectName,
      topicId = null,
      type = 'study',
      dueDate,
      scheduledDate,
      durationHours = 2,
      priority = 'medium',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    let finalSubjectName = subjectName || '';
    let finalSubjectId = subjectId;

    if (subjectId) {
      const sub = await SubjectModel.findOne({ _id: subjectId, userId }).lean();
      if (sub) {
        finalSubjectName = sub.name;
        finalSubjectId = sub._id.toString();
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const created = await TaskModel.create({
      userId,
      subjectId: finalSubjectId || 'general',
      subjectName: finalSubjectName || 'General Study',
      topicId: topicId || null,
      title: title.trim(),
      type: ['study', 'assignment', 'exam', 'revision'].includes(type) ? type : 'study',
      dueDate: dueDate || todayStr,
      scheduledDate: scheduledDate || todayStr,
      durationHours: Math.min(Math.max(Number(durationHours) || 2, 0.25), 12),
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
      completed: false,
      completedAt: null,
      isRescheduled: false,
    });

    const result = {
      ...created.toObject(),
      id: created._id.toString(),
      _id: created._id.toString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: result,
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create task.' });
  }
}

/**
 * PUT /api/tasks/:id
 * Update an existing task (scoped by userId)
 */
export async function updateTask(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;
    const { title, scheduledDate, dueDate, durationHours, priority, type, completed, subjectId, topicId } = req.body;

    const task = await TaskModel.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    if (title) task.title = title.trim();
    if (scheduledDate) task.scheduledDate = scheduledDate;
    if (dueDate) task.dueDate = dueDate;
    if (durationHours !== undefined) task.durationHours = Number(durationHours);
    if (priority) task.priority = priority;
    if (type) task.type = type;
    if (subjectId) task.subjectId = subjectId;
    if (topicId !== undefined) task.topicId = topicId;
    if (completed !== undefined) {
      task.completed = Boolean(completed);
      task.completedAt = task.completed ? new Date() : null;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: {
        ...task.toObject(),
        id: task._id.toString(),
        _id: task._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ success: false, error: 'Failed to update task.' });
  }
}

/**
 * PATCH /api/tasks/:id/complete
 * Toggle or set task completion state (scoped by userId)
 */
export async function toggleTaskComplete(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const task = await TaskModel.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    return res.status(200).json({
      success: true,
      message: task.completed ? '🎉 Task marked complete!' : 'Task reopened.',
      task: {
        ...task.toObject(),
        id: task._id.toString(),
        _id: task._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return res.status(500).json({ success: false, error: 'Failed to toggle task completion.' });
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task (scoped by userId)
 */
export async function deleteTask(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const task = await TaskModel.findOneAndDelete({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete task.' });
  }
}
