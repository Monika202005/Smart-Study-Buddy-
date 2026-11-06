import React, { useState } from 'react';
import {
  X,
  CalendarDays,
  Clock,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flag,
} from 'lucide-react';
/* Pure-JS helpers — no external date library needed */
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const PRIORITY_BADGE = {
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

export default function TaskDetailModal({ task, subjects = [], onClose, onReschedule, onToggleComplete, onDelete }) {
  const today = toDateStr(new Date());
  const tomorrow = toDateStr(new Date(Date.now() + 86400000));

  const [newDate, setNewDate] = useState(task?.scheduledDate || today);
  const [rescheduling, setRescheduling] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!task) return null;

  const subject = subjects.find((s) => s.id === task.subjectId);

  const handleReschedule = async () => {
    if (newDate === task.scheduledDate) {
      setFeedback({ type: 'warn', msg: 'Pick a different date to reschedule.' });
      return;
    }
    setRescheduling(true);
    try {
      await onReschedule(task.id, newDate);
      setFeedback({ type: 'ok', msg: `Rescheduled to ${newDate}` });
      setTimeout(onClose, 1200);
    } catch {
      setFeedback({ type: 'err', msg: 'Reschedule failed. Try again.' });
    } finally {
      setRescheduling(false);
    }
  };

  const isOverdue = task.scheduledDate < today && !task.completed;
  const isToday = task.scheduledDate === today;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isOverdue && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                  <AlertCircle className="w-3 h-3" /> Overdue
                </span>
              )}
              {isToday && !isOverdue && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
                  <Sparkles className="w-3 h-3" /> Today
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium}`}>
                <Flag className="w-3 h-3 inline mr-0.5" />
                {task.priority || 'medium'} priority
              </span>
              {task.completed && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <h2 className={`text-base font-extrabold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <CalendarDays className="w-3 h-3" /> Scheduled
              </div>
              <p className="text-sm font-semibold text-white">{task.scheduledDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <Clock className="w-3 h-3" /> Duration
              </div>
              <p className="text-sm font-semibold text-white">{task.durationHours || 1}h</p>
            </div>
            {subject && (
              <div className="col-span-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  <BookOpen className="w-3 h-3" /> Subject
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subject.color || '#6366f1' }} />
                  <p className="text-sm font-semibold text-white">{subject.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reschedule section */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reschedule Task
            </p>
            <div className="flex gap-2">
              <input
                type="date"
                value={newDate}
                min={today}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => setNewDate(today)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Today
              </button>
              <button
                onClick={() => setNewDate(tomorrow)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Tmr
              </button>
            </div>
            <button
              onClick={handleReschedule}
              disabled={rescheduling}
              className="w-full py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' :
              feedback.type === 'warn' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' :
              'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {feedback.msg}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={() => { onToggleComplete(task.id); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              task.completed
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {task.completed ? 'Mark Pending' : 'Mark Complete'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
