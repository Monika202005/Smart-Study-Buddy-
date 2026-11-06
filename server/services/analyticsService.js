/**
 * Pure helper functions for analytics and streak calculation
 */

export function toDateString(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the calendar days left between targetDate and today at local midnight.
 */
export function calculateCalendarDaysLeft(targetDate, baseDate = new Date()) {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;

  const base = new Date(baseDate);
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
  const baseMidnight = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);

  const diffMs = targetMidnight.getTime() - baseMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Pure function: calculates consecutive active study days.
 * An active day has >= 1 completed task or >= 1 study session.
 * Streak counts backwards from today (or from yesterday if today has not yet been logged).
 *
 * @param {Array<string>|Set<string>} activeDatesSet - Collection of YYYY-MM-DD date strings
 * @param {string} todayStr - YYYY-MM-DD anchor date
 * @returns {number} consecutive active days
 */
export function calculateStreak(activeDatesSet, today = new Date()) {
  const dates = activeDatesSet instanceof Set ? activeDatesSet : new Set(activeDatesSet || []);
  if (dates.size === 0) return 0;

  const todayStr = typeof today === 'string' ? today : toDateString(today);
  const [y, m, d] = todayStr.split('-').map(Number);
  const anchorDate = new Date(y, m - 1, d, 0, 0, 0);

  let checkDate = new Date(anchorDate);
  const todayFormatted = toDateString(checkDate);

  if (!dates.has(todayFormatted)) {
    // Check if yesterday was active
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayFormatted = toDateString(checkDate);
    if (!dates.has(yesterdayFormatted)) {
      return 0; // Streak broken: neither today nor yesterday had activity
    }
  }

  let streak = 0;
  while (true) {
    const formatted = toDateString(checkDate);
    if (dates.has(formatted)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

