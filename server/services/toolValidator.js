/**
 * Tool Argument Validator
 *
 * Enforces server-side validation schemas for all tool calls:
 * - Types and required fields
 * - Length caps
 * - Enum bounds
 * - ISO date format (YYYY-MM-DD), calendar validity, and sanity bounds
 *
 * Returns { valid: true, data: sanitizedArgs } or { valid: false, error: string, details: string[] }
 */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates whether a date string is a real calendar date in YYYY-MM-DD format
 * and falls within a sane window (not before 2020 and not beyond 2035).
 */
export function validateISODate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!ISO_DATE_REGEX.test(dateStr)) return false;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (year < 2020 || year > 2035) return false;
  if (month < 1 || month > 12) return false;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return false;
  }

  return true;
}

export function validateToolArguments(toolName, args = {}) {
  const details = [];

  if (typeof args !== 'object' || args === null || Array.isArray(args)) {
    return {
      valid: false,
      error: 'Tool arguments must be a JSON object.',
      details: ['Arguments was not a key-value object.'],
    };
  }

  switch (toolName) {
    case 'get_today_plan':
    case 'reschedule_missed': {
      // These take no required arguments
      return { valid: true, data: {} };
    }

    case 'create_task': {
      const sanitized = {};

      // 1. title: required string, 1 - 150 chars
      if (!args.title || typeof args.title !== 'string') {
        details.push('Field "title" is required and must be a string.');
      } else {
        const titleTrimmed = args.title.trim();
        if (titleTrimmed.length === 0) {
          details.push('Field "title" cannot be empty.');
        } else if (titleTrimmed.length > 150) {
          details.push('Field "title" exceeds maximum limit of 150 characters.');
        } else {
          sanitized.title = titleTrimmed;
        }
      }

      // 2. subjectName: optional string, max 100 chars
      if (args.subjectName !== undefined && args.subjectName !== null) {
        if (typeof args.subjectName !== 'string') {
          details.push('Field "subjectName" must be a string.');
        } else {
          const subTrimmed = args.subjectName.trim().slice(0, 100);
          sanitized.subjectName = subTrimmed;
        }
      }

      // 3. durationHours: optional number, 0.5 to 8
      if (args.durationHours !== undefined && args.durationHours !== null) {
        const num = Number(args.durationHours);
        if (isNaN(num)) {
          details.push('Field "durationHours" must be a valid number.');
        } else if (num < 0.5 || num > 8) {
          details.push('Field "durationHours" must be between 0.5 and 8.0 hours.');
        } else {
          sanitized.durationHours = num;
        }
      } else {
        sanitized.durationHours = 1.5;
      }

      // 4. priority: optional enum ['high', 'medium', 'low']
      if (args.priority !== undefined && args.priority !== null) {
        const prio = String(args.priority).toLowerCase().trim();
        if (!['high', 'medium', 'low'].includes(prio)) {
          details.push('Field "priority" must be one of: "high", "medium", "low".');
        } else {
          sanitized.priority = prio;
        }
      } else {
        sanitized.priority = 'medium';
      }

      // 5. dueDate: optional ISO date string
      if (args.dueDate !== undefined && args.dueDate !== null && String(args.dueDate).trim() !== '') {
        const dateStr = String(args.dueDate).trim();
        if (!validateISODate(dateStr)) {
          details.push('Field "dueDate" must be a valid ISO date string in YYYY-MM-DD format (between 2020 and 2035).');
        } else {
          sanitized.dueDate = dateStr;
        }
      } else {
        sanitized.dueDate = new Date().toISOString().split('T')[0];
      }

      if (details.length > 0) {
        return {
          valid: false,
          error: `Invalid arguments for tool "${toolName}".`,
          details,
        };
      }

      return { valid: true, data: sanitized };
    }

    case 'generate_flashcards': {
      const sanitized = {};

      // 1. topic: required string, 1 - 100 chars
      if (!args.topic || typeof args.topic !== 'string') {
        details.push('Field "topic" is required and must be a string.');
      } else {
        const topicTrimmed = args.topic.trim();
        if (topicTrimmed.length === 0) {
          details.push('Field "topic" cannot be empty.');
        } else if (topicTrimmed.length > 100) {
          details.push('Field "topic" exceeds maximum limit of 100 characters.');
        } else {
          sanitized.topic = topicTrimmed;
        }
      }

      // 2. subject: optional string, max 100 chars
      if (args.subject !== undefined && args.subject !== null) {
        if (typeof args.subject !== 'string') {
          details.push('Field "subject" must be a string.');
        } else {
          sanitized.subject = args.subject.trim().slice(0, 100);
        }
      } else {
        sanitized.subject = 'Computer Science';
      }

      // 3. count: optional integer, cap at 10
      if (args.count !== undefined && args.count !== null) {
        const c = parseInt(args.count, 10);
        if (isNaN(c) || c < 1) {
          details.push('Field "count" must be an integer of at least 1.');
        } else {
          sanitized.count = Math.min(c, 10); // cap at 10 per specification
        }
      } else {
        sanitized.count = 3;
      }

      if (details.length > 0) {
        return {
          valid: false,
          error: `Invalid arguments for tool "${toolName}".`,
          details,
        };
      }

      return { valid: true, data: sanitized };
    }

    default:
      return {
        valid: false,
        error: `Unknown tool "${toolName}".`,
        details: [`Tool name "${toolName}" is not recognized by StudyBuddy.`],
      };
  }
}
