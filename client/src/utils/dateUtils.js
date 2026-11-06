/**
 * Date and Countdown Utilities for StudyBuddy
 *
 * Implements calendar-day difference calculation at local midnight.
 * Avoids 24h truncation/floor/ceil issues and UTC offset drift
 * so "exam tomorrow" never says "0 days left".
 */

export function calculateCalendarDaysLeft(targetDateStr) {
  if (!targetDateStr) return 0;
  const parts = targetDateStr.includes('T')
    ? targetDateStr.split('T')[0].split('-').map(Number)
    : targetDateStr.split('-').map(Number);

  if (parts.length < 3 || parts.some(isNaN)) return 0;

  const [year, month, day] = parts;
  const targetMidnight = new Date(year, month - 1, day, 0, 0, 0, 0);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDaysLeftLabel(daysLeft) {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return `In ${daysLeft} Days`;
}
