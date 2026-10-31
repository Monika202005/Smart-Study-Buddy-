import ReminderModel, { memoryReminders } from '../models/Reminder.js';
import { getDBStatus } from '../config/db.js';

/**
 * GET /api/reminders
 * List reminders for current user (Member B)
 */
export async function getReminders(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';

    let reminders = [];
    if (getDBStatus().connected) {
      try {
        const docs = await ReminderModel.find({ userId }).sort({ remindAt: 1 }).lean();
        reminders = docs.map(d => ({ ...d, id: d._id.toString() }));
      } catch (e) {}
    }

    if (reminders.length === 0) {
      reminders = memoryReminders.filter(r => r.userId === userId);
    }

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch reminders.' });
  }
}

/**
 * POST /api/reminders
 * Schedule a new study reminder (Member B)
 */
export async function createReminder(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || 'default_student_1';
    const { title, remindAt, taskId = null, email = '' } = req.body;

    if (!title || !remindAt) {
      return res.status(400).json({ success: false, error: 'Title and remindAt date are required.' });
    }

    const remId = `rem_${Date.now()}`;
    const newReminder = {
      _id: remId,
      id: remId,
      userId,
      taskId,
      title: title.trim(),
      email: email || req.user?.email || 'monika@studybuddy.dev',
      remindAt: new Date(remindAt),
      sent: false,
      status: 'pending',
      createdAt: new Date(),
    };

    memoryReminders.unshift(newReminder);

    if (getDBStatus().connected) {
      try {
        const created = await ReminderModel.create(newReminder);
        newReminder._id = created._id.toString();
        newReminder.id = created._id.toString();
      } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Reminder scheduled successfully.',
      reminder: newReminder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not schedule reminder.' });
  }
}

/**
 * DELETE /api/reminders/:id
 * Delete/cancel a reminder (Member B)
 */
export async function deleteReminder(req, res) {
  try {
    const { id } = req.params;

    const idx = memoryReminders.findIndex(r => r.id === id || r._id === id);
    if (idx !== -1) {
      memoryReminders.splice(idx, 1);
    }

    if (getDBStatus().connected) {
      try {
        await ReminderModel.findByIdAndDelete(id);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Reminder cancelled successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not delete reminder.' });
  }
}
