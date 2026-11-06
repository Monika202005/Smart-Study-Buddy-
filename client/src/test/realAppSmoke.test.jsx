import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { useStore } from '../store/useStore';
import {
  createSubjectApi,
  createTaskApi,
  triggerGeneratePlanApi,
  logStudySessionApi,
} from '../services/api';

describe('Real Web App Client Smoke Tests (Phase 3 Integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useStore.setState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  });

  it('redirects unauthenticated users from protected workspace to /login', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
  });

  it('creates a new subject via createSubjectApi', async () => {
    const mockSubject = {
      id: 'sub_101',
      _id: 'sub_101',
      name: 'Computer Networks',
      code: 'CN201',
      color: '#06b6d4',
      examDate: '2026-11-25',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, subject: mockSubject }),
    });

    const res = await createSubjectApi({
      name: 'Computer Networks',
      code: 'CN201',
      color: '#06b6d4',
      examDate: '2026-11-25',
    });

    expect(res.success).toBe(true);
    expect(res.subject.name).toBe('Computer Networks');
    expect(res.subject.code).toBe('CN201');
  });

  it('creates a study task via createTaskApi', async () => {
    const mockTask = {
      id: 'task_501',
      _id: 'task_501',
      title: 'Read RFC 793 TCP Specification',
      subjectName: 'Computer Networks',
      durationHours: 2,
      priority: 'high',
      dueDate: '2026-11-20',
      scheduledDate: '2026-11-20',
      completed: false,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, task: mockTask }),
    });

    const res = await createTaskApi({
      title: 'Read RFC 793 TCP Specification',
      subjectName: 'Computer Networks',
      durationHours: 2,
      priority: 'high',
      dueDate: '2026-11-20',
      scheduledDate: '2026-11-20',
    });

    expect(res.success).toBe(true);
    expect(res.task.title).toBe('Read RFC 793 TCP Specification');
    expect(res.task.priority).toBe('high');
  });

  it('generates study plan preview via triggerGeneratePlanApi', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        committed: false,
        tasksCount: 4,
        planSummary: {
          totalHoursScheduled: 8,
          revisionTasksCount: 1,
          studyTasksCount: 3,
        },
        tasks: [
          { title: 'Study: Packet Switching', type: 'study', durationHours: 2 },
          { title: '🎯 Comprehensive Revision: Computer Networks', type: 'revision', durationHours: 2 },
        ],
      }),
    });

    const res = await triggerGeneratePlanApi({ commit: false });
    expect(res.success).toBe(true);
    expect(res.committed).toBe(false);
    expect(res.tasksCount).toBe(4);
    expect(res.planSummary.studyTasksCount).toBe(3);
    expect(res.planSummary.revisionTasksCount).toBe(1);
  });

  it('logs a study session to MongoDB via logStudySessionApi', async () => {
    const mockSession = {
      id: 'sess_901',
      durationMin: 25,
      date: '2026-11-06',
      notes: 'Deep work on TCP congestion window',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, session: mockSession }),
    });

    const res = await logStudySessionApi({
      durationMin: 25,
      date: '2026-11-06',
      notes: 'Deep work on TCP congestion window',
    });

    expect(res.success).toBe(true);
    expect(res.session.durationMin).toBe(25);
    expect(res.session.notes).toBe('Deep work on TCP congestion window');
  });
});
