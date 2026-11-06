import cron from 'node-cron';
import nodemailer from 'nodemailer';
import ReminderModel from '../models/Reminder.js';

let transporter = null;
let smtpWarningLogged = false;

export async function initEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user, pass },
      });
      console.log('📧 Nodemailer configured with production SMTP host:', host);
    } catch (err) {
      console.warn('⚠️ Nodemailer setup warning:', err.message);
    }
  } else {
    if (!smtpWarningLogged) {
      console.warn('⚠️ SMTP credentials not configured (SMTP_HOST/USER/PASS). Reminder notifications will be simulated.');
      smtpWarningLogged = true;
    }
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

export async function sendReminderEmail(reminder) {
  try {
    const toEmail = reminder.email;
    if (!toEmail) return null;

    const mailOptions = {
      from: '"StudyBuddy" <no-reply@studybuddy.dev>',
      to: toEmail,
      subject: `🔔 Study Reminder: ${reminder.title}`,
      text: `Hello!\n\nThis is your StudyBuddy scheduled reminder:\n\n"${reminder.title}"\n\nScheduled for: ${new Date(reminder.remindAt).toLocaleTimeString()}\n\nLog in at http://localhost:5173 to start your session!`,
    };

    if (transporter) {
      return await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    console.warn('[node-cron] Email dispatch warning:', err.message);
  }
}

export function startReminderCronJob() {
  initEmailTransporter();

  // Run every minute
  return cron.schedule('* * * * *', async () => {
    const now = new Date();
    try {
      const dueReminders = await ReminderModel.find({
        sent: false,
        remindAt: { $lte: now },
      });

      for (const rem of dueReminders) {
        await sendReminderEmail(rem);
        rem.sent = true;
        rem.sentAt = new Date();
        rem.status = 'sent';
        await rem.save();
      }
    } catch (e) {
      // Don't crash cron job on transient error
    }
  });
}
