/**
 * StudyBuddy Frontend API Client
 * Connects to the Express backend on /api
 */

const BASE_URL = '/api';

export async function checkServerHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    console.warn('Health check failed:', err.message);
    return { status: 'offline' };
  }
}

// ==========================================
// MEMBER 1: Chatbot & Context APIs
// ==========================================

export async function sendChatMessage(message, userId = 'default_student_1') {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

export async function fetchChatHistory(userId = 'default_student_1', limit = 50) {
  const res = await fetch(`${BASE_URL}/chat/history?userId=${encodeURIComponent(userId)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load chat history');
  return await res.json();
}

export async function clearChatHistoryApi(userId = 'default_student_1') {
  const res = await fetch(`${BASE_URL}/chat/history?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear chat history');
  return await res.json();
}

// ==========================================
// MEMBER 1: Flashcards & Quiz APIs
// ==========================================

export async function fetchFlashcardsApi(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/quiz/flashcards${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to load flashcards');
  return await res.json();
}

export async function generateQuizApi(topic, subject, count = 3) {
  const res = await fetch(`${BASE_URL}/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, subject, count }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate quiz questions');
  }
  return await res.json();
}

export async function recordQuizResultApi(cardId, result, selectedOption = null) {
  const res = await fetch(`${BASE_URL}/quiz/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, result, selectedOption }),
  });
  if (!res.ok) throw new Error('Failed to record result');
  return await res.json();
}

export async function fetchWeakTopicsApi() {
  const res = await fetch(`${BASE_URL}/quiz/weak-topics`);
  if (!res.ok) throw new Error('Failed to load weak topics');
  return await res.json();
}

// ==========================================
// TEAMMATES INTEGRATION STUB APIS
// ==========================================

export async function fetchSubjectsApi() {
  const res = await fetch(`${BASE_URL}/subjects`);
  return await res.json();
}

export async function fetchTasksApi() {
  const res = await fetch(`${BASE_URL}/tasks`);
  return await res.json();
}

export async function toggleTaskCompleteApi(taskId) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, { method: 'PATCH' });
  return await res.json();
}

export async function triggerGeneratePlanApi() {
  const res = await fetch(`${BASE_URL}/planner/generate`, { method: 'POST' });
  return await res.json();
}

export async function triggerRescheduleMissedApi() {
  const res = await fetch(`${BASE_URL}/planner/reschedule-missed`, { method: 'POST' });
  return await res.json();
}

export async function fetchAnalyticsSummaryApi() {
  const res = await fetch(`${BASE_URL}/analytics/summary`);
  return await res.json();
}
