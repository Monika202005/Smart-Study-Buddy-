import ReminderModel from '../models/Reminder.js';

/**
 * GET /api/reminders
 * List reminders for current user
 */
export async function getReminders(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const docs = await ReminderModel.find({ userId }).sort({ remindAt: 1 }).lean();
    const reminders = docs.map((d) => ({ ...d, id: d._id.toString() }));

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return res.status(500).json({ success: false, error: 'Could not fetch reminders.' });
  }
}

/**
 * POST /api/reminders
 * Schedule a new study reminder
 */
export async function createReminder(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { title, remindAt, taskId = null, email = '' } = req.body;

    if (!title || !remindAt) {
      return res.status(400).json({ success: false, error: 'Title and remindAt date are required.' });
    }

    const parsedDate = new Date(remindAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid remindAt date format.' });
    }

    const created = await ReminderModel.create({
      userId,
      taskId: taskId || null,
      title: title.trim(),
      email: email || req.user?.email || '',
      remindAt: parsedDate,
      sent: false,
      status: 'pending',
    });

    const result = {
      ...created.toObject(),
      id: created._id.toString(),
      _id: created._id.toString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Reminder scheduled successfully.',
      reminder: result,
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return res.status(500).json({ success: false, error: 'Could not schedule reminder.' });
  }
}

/**
 * DELETE /api/reminders/:id
 * Delete/cancel a reminder (scoped by userId)
 */
export async function deleteReminder(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const reminder = await ReminderModel.findOneAndDelete({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return res.status(500).json({ success: false, error: 'Could not delete reminder.' });
  }
}
