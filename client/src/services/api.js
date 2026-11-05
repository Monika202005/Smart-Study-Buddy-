/**
 * StudyBuddy Frontend API Client
 * Connects to the Express backend on /api
 */

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('studybuddy_token') || 'mock_jwt_token_studybuddy_monika';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

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
// AUTHENTICATION APIS (Member B & C)
// ==========================================

export async function loginUserApi(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed. Please check your credentials.');
  }
  return await res.json();
}

export async function registerUserApi(userData) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed. Please try again.');
  }
  return await res.json();
}

// ==========================================
// MEMBER C: Planner & Tasks APIs
// ==========================================

export async function fetchTasksApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/tasks${query ? `?${query}` : ''}`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function createTaskApi(taskData) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create task');
  }
  return await res.json();
}

export async function toggleTaskCompleteApi(taskId) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function rescheduleTaskApi(taskId, scheduledDate) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scheduledDate }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reschedule task');
  }
  return await res.json();
}

export async function triggerGeneratePlanApi() {
  const res = await fetch(`${BASE_URL}/planner/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function triggerRescheduleMissedApi() {
  const res = await fetch(`${BASE_URL}/planner/reschedule-missed`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return await res.json();
}

// ==========================================
// MEMBER C: Subjects & Topics APIs
// ==========================================

export async function fetchSubjectsApi() {
  const res = await fetch(`${BASE_URL}/subjects`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function createSubjectApi(data) {
  const res = await fetch(`${BASE_URL}/subjects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create subject');
  }
  return await res.json();
}

export async function deleteSubjectApi(subjectId) {
  const res = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete subject');
  return await res.json();
}

export async function createTopicApi(subjectId, data) {
  const res = await fetch(`${BASE_URL}/subjects/${subjectId}/topics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create topic');
  }
  return await res.json();
}

export async function updateTopicStatusApi(topicId, status) {
  const res = await fetch(`${BASE_URL}/topics/${topicId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update topic status');
  return await res.json();
}

export async function deleteTopicApi(topicId) {
  const res = await fetch(`${BASE_URL}/topics/${topicId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete topic');
  return await res.json();
}

// ==========================================
// ANALYTICS (Member D)
// ==========================================

export async function fetchAnalyticsSummaryApi() {
  const res = await fetch(`${BASE_URL}/analytics/summary`);
  return await res.json();
}
