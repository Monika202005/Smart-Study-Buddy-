/**
 * StudyBuddy Frontend API Client
 * Connects to the Express backend on /api
 */

const BASE_URL = '/api';

/**
 * Helper to get authentication headers from local storage.
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('studybuddy_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Global 401 handler: clears the token and user session,
 * and notifies components/store to redirect to /login.
 */
export function handleUnauthorized() {
  localStorage.removeItem('studybuddy_token');
  localStorage.removeItem('studybuddy_user');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studybuddy:unauthorized'));
  }
}

/**
 * Standardized fetch wrapper with JWT attachment and 401 session clearance.
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('studybuddy_token');
  const base =
    typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'http://localhost:5173';
  const path = url.startsWith('/api') ? url : `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  const fullUrl = url.startsWith('http') ? url : `${base}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(fullUrl, { ...options, headers });

  if (res.status === 401) {
    handleUnauthorized();
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Session expired or unauthorized. Please log in again.');
  }

  return res;
}

export async function checkServerHealth() {
  try {
    const res = await apiFetch('/health');
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
  const res = await apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

export async function fetchChatHistory(userId = 'default_student_1', limit = 50) {
  const res = await apiFetch(`/chat/history?userId=${encodeURIComponent(userId)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load chat history');
  return await res.json();
}

export async function clearChatHistoryApi(userId = 'default_student_1') {
  const res = await apiFetch(`/chat/history?userId=${encodeURIComponent(userId)}`, {
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
  const res = await apiFetch(`/quiz/flashcards${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to load flashcards');
  return await res.json();
}

export async function generateQuizApi(topic, subject, count = 3) {
  const res = await apiFetch('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({ topic, subject, count }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate quiz questions');
  }
  return await res.json();
}

export async function recordQuizResultApi(cardId, result, selectedOption = null) {
  const res = await apiFetch('/quiz/result', {
    method: 'POST',
    body: JSON.stringify({ cardId, result, selectedOption }),
  });
  if (!res.ok) throw new Error('Failed to record result');
  return await res.json();
}

export async function fetchWeakTopicsApi() {
  const res = await apiFetch('/quiz/weak-topics');
  if (!res.ok) throw new Error('Failed to load weak topics');
  return await res.json();
}

// ==========================================
// AUTHENTICATION APIS (Member B & C)
// ==========================================

export async function loginUserApi(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed. Please check your credentials.');
  }
  return await res.json();
}

export async function registerUserApi(userData) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed. Please try again.');
  }
  return await res.json();
}

export async function fetchCurrentUserApi() {
  const res = await apiFetch('/auth/me');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch current user.');
  }
  return await res.json();
}

export async function updateUserProfileApi(profileData) {
  const res = await apiFetch('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update profile.');
  }
  return await res.json();
}

export async function logStudySessionApi(sessionData) {
  const res = await apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log study session.');
  }
  return await res.json();
}

export async function fetchStudySessionsApi() {
  const res = await apiFetch('/sessions');
  return await res.json();
}

export async function deleteTaskApi(taskId) {
  const res = await apiFetch(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return await res.json();
}

// ==========================================
// MEMBER C: Planner & Tasks APIs
// ==========================================

export async function fetchTasksApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/tasks${query ? `?${query}` : ''}`);
  return await res.json();
}

export async function createTaskApi(taskData) {
  const res = await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create task');
  }
  return await res.json();
}

export async function toggleTaskCompleteApi(taskId) {
  const res = await apiFetch(`/tasks/${taskId}/complete`, {
    method: 'PATCH',
  });
  return await res.json();
}

export async function rescheduleTaskApi(taskId, scheduledDate) {
  const res = await apiFetch(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ scheduledDate }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reschedule task');
  }
  return await res.json();
}

export async function triggerGeneratePlanApi(options = { commit: true }) {
  const res = await apiFetch('/planner/generate', {
    method: 'POST',
    body: JSON.stringify(options),
  });
  return await res.json();
}

export async function triggerRescheduleMissedApi(options = { commit: true }) {
  const res = await apiFetch('/planner/reschedule-missed', {
    method: 'POST',
    body: JSON.stringify(options),
  });
  return await res.json();
}

// ==========================================
// MEMBER C: Subjects & Topics APIs
// ==========================================

export async function fetchSubjectsApi() {
  const res = await apiFetch('/subjects');
  return await res.json();
}

export async function createSubjectApi(data) {
  const res = await apiFetch('/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create subject');
  }
  return await res.json();
}

export async function deleteSubjectApi(subjectId) {
  const res = await apiFetch(`/subjects/${subjectId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete subject');
  return await res.json();
}

export async function createTopicApi(subjectId, data) {
  const res = await apiFetch(`/subjects/${subjectId}/topics`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create topic');
  }
  return await res.json();
}

export async function updateTopicStatusApi(topicId, status) {
  const res = await apiFetch(`/topics/${topicId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update topic status');
  return await res.json();
}

export async function deleteTopicApi(topicId) {
  const res = await apiFetch(`/topics/${topicId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete topic');
  return await res.json();
}

// ==========================================
// ANALYTICS (Member D)
// ==========================================

export async function fetchAnalyticsSummaryApi() {
  const res = await apiFetch('/analytics/summary');
  return await res.json();
}
