import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, RotateCcw, Sparkles, CheckCircle2, Clock, Bot } from 'lucide-react';
import TeammateModuleStub from '../components/layout/TeammateModuleStub';
import { fetchTasksApi, triggerGeneratePlanApi, triggerRescheduleMissedApi, toggleTaskCompleteApi } from '../services/api';
import { useStore } from '../store/useStore';

export default function PlannerPage() {
  const { openChatWithPrompt } = useStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await fetchTasksApi();
      setTasks(data.tasks || []);
    } catch (e) {
      console.warn('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = async (taskId) => {
    try {
      const res = await toggleTaskCompleteApi(taskId);
      if (res.success && res.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: res.task.completed } : t))
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      const res = await triggerGeneratePlanApi();
      setActionFeedback(res.message || 'Auto-generated study plan calculated!');
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReschedule = async () => {
    try {
      const res = await triggerRescheduleMissedApi();
      setActionFeedback(res.message || 'Rescheduled missed tasks.');
      loadTasks();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <TeammateModuleStub
      title="Smart Study Planner & Task Board"
      memberLetter="C"
      memberRole="Planner UI + Subjects"
      description="Interactive calendar view, drag-and-drop task scheduling, syllabus-to-plan generation, and missed task rebalancing."
      apisPlanned={[
        'POST /api/planner/generate',
        'POST /api/planner/reschedule-missed',
        'GET/POST /api/tasks',
        'PATCH /api/tasks/:id/complete',
      ]}
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Generate AI Study Plan</span>
            </button>

            <button
              onClick={handleReschedule}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reschedule Missed Tasks</span>
            </button>
          </div>

          <button
            onClick={() => openChatWithPrompt('Add a study task for tomorrow: Review Dynamic Programming for 2 hours')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask Chatbot to Add Task</span>
          </button>
        </div>

        {/* Feedback alert */}
        {actionFeedback && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Task Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Overdue / Missed */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                Overdue / Missed
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {tasks.filter((t) => !t.completed && t.scheduledDate < new Date().toISOString().split('T')[0]).length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks
                .filter((t) => !t.completed && t.scheduledDate < new Date().toISOString().split('T')[0])
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 text-xs space-y-1"
                  >
                    <p className="font-semibold text-rose-200">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.subjectName} &bull; Due: {t.dueDate}</p>
                    <button
                      onClick={handleReschedule}
                      className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 mt-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Roll over to today
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: Today's Tasks */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                Today's Schedule
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                {tasks.filter((t) => t.scheduledDate === new Date().toISOString().split('T')[0]).length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks
                .filter((t) => t.scheduledDate === new Date().toISOString().split('T')[0])
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {t.subjectName} &bull; {t.durationHours}h &bull; Priority: {t.priority}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Upcoming Tomorrow & Beyond */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Upcoming Days
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                {tasks.filter((t) => t.scheduledDate > new Date().toISOString().split('T')[0]).length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks
                .filter((t) => t.scheduledDate > new Date().toISOString().split('T')[0])
                .map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <p className="font-semibold text-slate-300">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.subjectName} &bull; Scheduled: {t.scheduledDate}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </TeammateModuleStub>
  );
}
