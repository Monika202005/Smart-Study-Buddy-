import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  LayoutList,
  Sparkles,
  RotateCcw,
  Bot,
  CheckCircle2,
  Plus,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import PlannerCalendar from '../components/planner/PlannerCalendar';
import TaskDetailModal from '../components/planner/TaskDetailModal';
import {
  fetchTasksApi,
  fetchSubjectsApi,
  triggerGeneratePlanApi,
  triggerRescheduleMissedApi,
  toggleTaskCompleteApi,
  rescheduleTaskApi,
  createTaskApi,
} from '../services/api';
import { useStore } from '../store/useStore';

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
const today = toDateStr(new Date());

const PRIORITY_BADGE = {
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

/* ── inline AddTask mini-form ── */
function AddTaskInline({ subjects, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [durationHours, setDurationHours] = useState(1);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Task title required.'); return; }
    setLoading(true);
    try {
      await onAdd({ title: title.trim(), subjectId, durationHours, priority, dueDate, scheduledDate: dueDate });
      onCancel();
    } catch (err) {
      setError(err.message || 'Failed to add task.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 shadow-lg space-y-3 animate-in fade-in duration-200">
      <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Task</p>
      {error && <div className="text-rose-300 text-[11px] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</div>}

      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title, e.g. 'Review AVL Trees'"
        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2 py-2 focus:border-indigo-500 focus:outline-none"
        >
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 whitespace-nowrap">Due date:</label>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 whitespace-nowrap">Hours:</label>
          <input
            type="number"
            min="0.5"
            max="8"
            step="0.5"
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {loading ? 'Adding…' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}

/* ── TaskCard (list view) ── */
function TaskCard({ task, onToggle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs space-y-1 transition-all group"
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`font-semibold truncate ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </p>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium}`}>
          {task.priority || 'medium'}
        </span>
        <span className="text-slate-500">{task.subjectName || 'Subject'}</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-500">{task.durationHours || 1}h</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-500">{task.scheduledDate}</span>
      </div>
    </div>
  );
}

/* ── Main PlannerPage ── */
export default function PlannerPage() {
  const { openChatWithPrompt } = useStore();

  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [reschedulingAll, setReschedulingAll] = useState(false);

  const showFeedback = (msg, type = 'ok') => {
    setActionFeedback({ msg, type });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, subjectRes] = await Promise.all([fetchTasksApi(), fetchSubjectsApi()]);
      setTasks(taskRes.tasks || []);
      setSubjects(subjectRes.subjects || []);
    } catch (e) {
      console.warn('Failed to load planner data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── actions ── */
  const handleToggle = async (taskId) => {
    try {
      const res = await toggleTaskCompleteApi(taskId);
      if (res.success && res.task) {
        setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, completed: res.task.completed } : t));
      }
    } catch (e) { console.warn(e); }
  };

  const handleRescheduleTask = async (taskId, newDate) => {
    try {
      const res = await rescheduleTaskApi(taskId, newDate);
      if (res.success) {
        setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, scheduledDate: newDate } : t));
        showFeedback(`Task rescheduled to ${newDate}`);
      }
    } catch (e) { throw e; }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await triggerGeneratePlanApi();
      showFeedback(res.message || 'AI study plan generated!');
      await loadAll();
    } catch (e) { showFeedback('Plan generation failed.', 'err'); }
    finally { setGeneratingPlan(false); }
  };

  const handleRescheduleAll = async () => {
    setReschedulingAll(true);
    try {
      const res = await triggerRescheduleMissedApi();
      showFeedback(res.message || `${res.rescheduledCount || 0} missed tasks rescheduled.`);
      await loadAll();
    } catch (e) { showFeedback('Reschedule failed.', 'err'); }
    finally { setReschedulingAll(false); }
  };

  const handleAddTask = async (taskData) => {
    const res = await createTaskApi(taskData);
    if (res.success && res.task) {
      setTasks((prev) => [res.task, ...prev]);
    }
    return res;
  };

  /* ── derived counts ── */
  const overdueCount = tasks.filter((t) => !t.completed && t.scheduledDate < today).length;
  const todayCount = tasks.filter((t) => t.scheduledDate === today).length;
  const upcomingCount = tasks.filter((t) => t.scheduledDate > today).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Smart Study Planner</h1>
          </div>
          <p className="text-xs text-slate-400">Drag & drop calendar, AI scheduling, and missed-task rebalancing.</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Board
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overdue', count: overdueCount, color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20' },
          { label: 'Today', count: todayCount, color: 'text-indigo-300', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Upcoming', count: upcomingCount, color: 'text-slate-200', bg: 'bg-slate-800/60 border-slate-700/60' },
          { label: 'Completed', count: completedCount, color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${bg} text-center`}>
            <p className={`text-2xl font-extrabold ${color}`}>{loading ? '—' : count}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Action Bar ── */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
        <button
          onClick={handleGeneratePlan}
          disabled={generatingPlan}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-60"
        >
          {generatingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {generatingPlan ? 'Generating…' : 'Generate AI Study Plan'}
        </button>

        <button
          onClick={handleRescheduleAll}
          disabled={reschedulingAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-60"
        >
          {reschedulingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          {reschedulingAll ? 'Rescheduling…' : 'Reschedule Missed'}
        </button>

        <button
          onClick={() => setShowAddTask((v) => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
            showAddTask
              ? 'bg-slate-700 text-white border-slate-600'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddTask ? 'Cancel' : 'Add Task'}
        </button>

        <button
          onClick={() => openChatWithPrompt('What should I study today? Show my current plan.')}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          Ask AI Tutor
        </button>
      </div>

      {/* ── Feedback Banner ── */}
      {actionFeedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
          actionFeedback.type === 'ok'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionFeedback.msg}
        </div>
      )}

      {/* ── Add Task Inline Form ── */}
      {showAddTask && (
        <AddTaskInline
          subjects={subjects}
          onAdd={handleAddTask}
          onCancel={() => setShowAddTask(false)}
        />
      )}

      {/* ── Main Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <PlannerCalendar
            tasks={tasks}
            onRescheduleTask={handleRescheduleTask}
            onToggleTask={handleToggle}
            onTaskClick={setSelectedTask}
          />
        </div>
      ) : (
        /* ── Board View ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overdue */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Overdue / Missed
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">{overdueCount}</span>
            </div>
            <div className="space-y-2">
              {tasks.filter((t) => !t.completed && t.scheduledDate < today).map((t) => (
                <TaskCard key={t.id} task={t} onToggle={handleToggle} onClick={() => setSelectedTask(t)} />
              ))}
              {overdueCount === 0 && <p className="text-[11px] text-slate-600 italic">No overdue tasks 🎉</p>}
            </div>
          </div>

          {/* Today */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Today's Schedule
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">{todayCount}</span>
            </div>
            <div className="space-y-2">
              {tasks.filter((t) => t.scheduledDate === today).map((t) => (
                <TaskCard key={t.id} task={t} onToggle={handleToggle} onClick={() => setSelectedTask(t)} />
              ))}
              {todayCount === 0 && <p className="text-[11px] text-slate-600 italic">No tasks today. Generate a plan!</p>}
            </div>
          </div>

          {/* Upcoming */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Upcoming Days
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">{upcomingCount}</span>
            </div>
            <div className="space-y-2">
              {tasks.filter((t) => t.scheduledDate > today).map((t) => (
                <TaskCard key={t.id} task={t} onToggle={handleToggle} onClick={() => setSelectedTask(t)} />
              ))}
              {upcomingCount === 0 && <p className="text-[11px] text-slate-600 italic">No upcoming tasks scheduled.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ── */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          subjects={subjects}
          onClose={() => setSelectedTask(null)}
          onReschedule={handleRescheduleTask}
          onToggleComplete={handleToggle}
        />
      )}
    </div>
  );
}
