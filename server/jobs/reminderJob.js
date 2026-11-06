import cron from 'node-cron';
import nodemailer from 'nodemailer';
import ReminderModel, { memoryReminders } from '../models/Reminder.js';
import { getDBStatus } from '../config/db.js';

let transporter = null;

// Initialize Nodemailer transporter
export async function initEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user, pass },
    });
    console.log('📧 Nodemailer configured with production SMTP host:', host);
  } else {
    // Development simulator transporter with Ethereal / JSON fallback
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    console.log('📧 Nodemailer initialized in development notification mode (node-cron active).');
  }
}

/**
 * Send an email notification for a scheduled study reminder (Member B)
 */
export async function sendReminderEmail(reminder) {
  try {
    const toEmail = reminder.email || 'monika@studybuddy.dev';
    const mailOptions = {
      from: '"StudyBuddy Study Assistant" <no-reply@studybuddy.dev>',
      to: toEmail,
      subject: `🔔 Study Reminder: ${reminder.title}`,
      text: `Hello!\n\nThis is your StudyBuddy scheduled reminder:\n\n"${reminder.title}"\n\nScheduled for: ${new Date(reminder.remindAt).toLocaleTimeString()}\n\nLog into StudyBuddy at http://localhost:5173 to start your focus session!\n\nHappy studying!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
          <h2 style="color: #6366f1; margin-top: 0;">🔔 StudyBuddy Focus Reminder</h2>
          <p style="font-size: 16px;">Hello student,</p>
          <div style="padding: 16px; background: #1e293b; border-left: 4px solid #6366f1; border-radius: 8px; margin: 16px 0;">
            <p style="font-size: 18px; font-weight: bold; margin: 0; color: #ffffff;">${reminder.title}</p>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">Scheduled time: ${new Date(reminder.remindAt).toLocaleTimeString()}</p>
          </div>
          <p>Ready to get focused? Launch a 25-minute Pomodoro block now.</p>
          <a href="http://localhost:5173/timer" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Focus Timer</a>
        </div>
      `,
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[node-cron] ✉️ Reminder email dispatched for "${reminder.title}" to ${toEmail}`);
      return info;
    }
  } catch (err) {
    console.warn('[node-cron] Email sending error:', err.message);
  }
}

/**
 * Start the background reminder cron job (Member B)
 * Checks every minute (* * * * *) for pending reminders
 */
export function startReminderCronJob() {
  initEmailTransporter();

  // Run every minute
  const cronTask = cron.schedule('* * * * *', async () => {
    const now = new Date();

    try {
      // 1. Process in-memory pending reminders
      const dueMemoryReminders = memoryReminders.filter(
        r => !r.sent && new Date(r.remindAt) <= now
      );

      for (const rem of dueMemoryReminders) {
        await sendReminderEmail(rem);
        rem.sent = true;
        rem.sentAt = new Date();
        rem.status = 'sent';
      }

      // 2. Process MongoDB pending reminders if connected
      if (getDBStatus().connected) {
        const dueDbReminders = await ReminderModel.find({
          sent: false,
          remindAt: { $lte: now },
        });

        for (const rem of dueDbReminders) {
          await sendReminderEmail(rem);
          rem.sent = true;
          rem.sentAt = new Date();
          rem.status = 'sent';
          await rem.save();
        }
      }
    } catch (cronErr) {
      console.error('[node-cron] Error checking pending reminders:', cronErr.message);
    }
  });

  console.log('⏰ Member B Reminder Cron Job scheduled: Running checks every minute.');
  return cronTask;
}
