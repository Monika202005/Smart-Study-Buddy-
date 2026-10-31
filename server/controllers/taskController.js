import TaskModel from '../models/Task.js';
import { mockTasks, mockSubjects } from '../models/mockPlannerStore.js';
import { getDBStatus } from '../config/db.js';

/**
 * GET /api/tasks
 * Fetch tasks with optional filters: ?date=YYYY-MM-DD, ?completed=true|false, ?subjectId=xyz (Member B)
 */
export async function getTasks(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { date, completed, subjectId } = req.query;

    let tasks = [];

    if (getDBStatus().connected) {
      try {
        const query = { userId };
        if (date) query.scheduledDate = date;
        if (completed !== undefined) query.completed = completed === 'true';
        if (subjectId) query.subjectId = subjectId;

        const dbTasks = await TaskModel.find(query).sort({ scheduledDate: 1, priority: -1 }).lean();
        tasks = dbTasks.map(t => ({
          ...t,
          id: t._id.toString(),
          _id: t._id.toString(),
        }));
      } catch (err) {
        console.warn('MongoDB task query failed, using memory store:', err.message);
      }
    }

    if (tasks.length === 0) {
      tasks = [...mockTasks];
      if (date) tasks = tasks.filter(t => t.scheduledDate === date);
      if (completed !== undefined) {
        const isComp = completed === 'true';
        tasks = tasks.filter(t => Boolean(t.completed) === isComp);
      }
      if (subjectId) tasks = tasks.filter(t => t.subjectId === subjectId);
    }

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
 * Create a new task (Member B)
 */
export async function createTask(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
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

    const matchedSubject = mockSubjects.find(s => s.id === subjectId || s._id === subjectId) || mockSubjects[0];
    const cleanSubjectName = subjectName || matchedSubject?.name || 'General';
    const cleanSubjectId = subjectId || matchedSubject?.id || 'cs_gen';
    const todayStr = new Date().toISOString().split('T')[0];

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTask = {
      id: taskId,
      _id: taskId,
      userId,
      subjectId: cleanSubjectId,
      subjectName: cleanSubjectName,
      topicId,
      title: title.trim(),
      type: ['study', 'assignment', 'exam', 'revision'].includes(type) ? type : 'study',
      dueDate: dueDate || todayStr,
      scheduledDate: scheduledDate || todayStr,
      durationHours: Math.min(Math.max(Number(durationHours) || 1.5, 0.25), 12),
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
      completed: false,
      createdAt: new Date(),
    };

    mockTasks.unshift(newTask);

    if (getDBStatus().connected) {
      try {
        const created = await TaskModel.create({
          userId,
          subjectId: newTask.subjectId,
          subjectName: newTask.subjectName,
          topicId: newTask.topicId,
          title: newTask.title,
          type: newTask.type,
          dueDate: newTask.dueDate,
          scheduledDate: newTask.scheduledDate,
          durationHours: newTask.durationHours,
          priority: newTask.priority,
          completed: false,
        });
        newTask._id = created._id.toString();
        newTask.id = created._id.toString();
      } catch (err) {
        console.warn('MongoDB task create fallback:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: newTask,
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create task.' });
  }
}

/**
 * PUT /api/tasks/:id
 * Update an existing task (title, scheduledDate, duration, priority, etc.) (Member B)
 */
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, scheduledDate, dueDate, durationHours, priority, type, completed } = req.body;

    let updated = null;

    const task = mockTasks.find(t => t.id === id || t._id === id);
    if (task) {
      if (title) task.title = title.trim();
      if (scheduledDate) task.scheduledDate = scheduledDate;
      if (dueDate) task.dueDate = dueDate;
      if (durationHours !== undefined) task.durationHours = Number(durationHours);
      if (priority) task.priority = priority;
      if (type) task.type = type;
      if (completed !== undefined) task.completed = Boolean(completed);
      updated = task;
    }

    if (getDBStatus().connected) {
      try {
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (scheduledDate) updateData.scheduledDate = scheduledDate;
        if (dueDate) updateData.dueDate = dueDate;
        if (durationHours !== undefined) updateData.durationHours = Number(durationHours);
        if (priority) updateData.priority = priority;
        if (type) updateData.type = type;
        if (completed !== undefined) {
          updateData.completed = Boolean(completed);
          updateData.completedAt = completed ? new Date() : null;
        }

        const doc = await TaskModel.findByIdAndUpdate(id, updateData, { new: true });
        if (doc) updated = doc;
      } catch (e) {}
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update task.' });
  }
}

/**
 * PATCH /api/tasks/:id/complete
 * Toggle or set task completion state (Member B)
 */
export async function toggleTaskComplete(req, res) {
  try {
    const { id } = req.params;
    let targetTask = mockTasks.find(t => t.id === id || t._id === id);

    if (targetTask) {
      targetTask.completed = !targetTask.completed;
      targetTask.completedAt = targetTask.completed ? new Date() : null;
    }

    if (getDBStatus().connected) {
      try {
        const doc = await TaskModel.findById(id);
        if (doc) {
          doc.completed = !doc.completed;
          doc.completedAt = doc.completed ? new Date() : null;
          await doc.save();
          targetTask = doc;
        }
      } catch (e) {}
    }

    if (!targetTask) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    return res.status(200).json({
      success: true,
      message: targetTask.completed ? '🎉 Task marked complete!' : 'Task reopened.',
      task: targetTask,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to toggle task completion.' });
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task (Member B)
 */
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const idx = mockTasks.findIndex(t => t.id === id || t._id === id);
    if (idx !== -1) {
      mockTasks.splice(idx, 1);
    }

    if (getDBStatus().connected) {
      try {
        await TaskModel.findByIdAndDelete(id);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete task.' });
  }
}
