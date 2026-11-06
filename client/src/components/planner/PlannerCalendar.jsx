import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, AlertCircle } from 'lucide-react';

/* ─── Pure-JS date helpers (no external library needed) ─── */
const pad = (n) => String(n).padStart(2, '0');

/** Format Date → 'yyyy-MM-dd' */
function fmt(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's string */
const todayStr = fmt(new Date());

/** Month name + year label */
function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

/** 
 * Build a Mon-anchored 6-week (42-cell) day grid for the given year/month.
 * Returns array of Date objects.
 */
function buildGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // getDay(): 0=Sun, 1=Mon …  We want Mon as col-0
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0, Tue=1 … Sun=6
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

/* ─── Priority colour maps ─── */
const PRIORITY_CELL = {
  high: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
  medium: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  low: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
};
const PRIORITY_DOT = { high: 'bg-rose-400', medium: 'bg-amber-400', low: 'bg-emerald-400' };

/* ─── DayCell ─── */
function DayCell({ date, tasks, currentMonth, onDrop, onTaskClick, dragging, setDragging }) {
  const dateStr = fmt(date);
  const dayTasks = tasks.filter((t) => t.scheduledDate === dateStr);
  const isThisMonth = date.getMonth() === currentMonth;
  const isToday = dateStr === todayStr;
  const isOverdue = dateStr < todayStr;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (dragging) onDrop(dragging, dateStr); }}
      className={`min-h-[88px] p-1 rounded-xl border transition-colors ${
        isToday
          ? 'border-indigo-500/60 bg-indigo-950/30'
          : isOverdue && isThisMonth
          ? 'border-slate-800/60 bg-rose-950/5'
          : 'border-slate-800/60 bg-slate-950/30 hover:border-slate-700/60'
      } ${!isThisMonth ? 'opacity-35' : ''}`}
    >
      {/* Day number */}
      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold mb-1 ${
        isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
      }`}>
        {date.getDate()}
      </div>

      {/* Task chips */}
      <div className="space-y-0.5">
        {dayTasks.slice(0, 3).map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => setDragging(task)}
            onDragEnd={() => setDragging(null)}
            onClick={() => onTaskClick(task)}
            title={task.title}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border cursor-grab active:cursor-grabbing text-[10px] font-medium truncate transition-opacity hover:opacity-75 ${
              task.completed
                ? 'opacity-40 line-through bg-slate-800/60 text-slate-500 border-slate-700'
                : PRIORITY_CELL[task.priority] || PRIORITY_CELL.medium
            }`}
          >
            <GripVertical className="w-2.5 h-2.5 shrink-0 opacity-40" />
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium}`} />
            <span className="truncate">{task.title}</span>
          </div>
        ))}
        {dayTasks.length > 3 && (
          <div className="text-[10px] text-slate-500 pl-1">+{dayTasks.length - 3} more</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Calendar ─── */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlannerCalendar({ tasks, onRescheduleTask, onToggleTask, onTaskClick }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dragging, setDragging] = useState(null);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const handleDrop = useCallback(
    (task, newDate) => {
      if (task.scheduledDate !== newDate) onRescheduleTask(task.id, newDate);
      setDragging(null);
    },
    [onRescheduleTask]
  );

  const grid = buildGrid(year, month);

  return (
    <div className="space-y-3 select-none">
      {/* Month navigator */}
      <div className="flex items-center justify-between px-1">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-white">{monthLabel(year, month)}</h3>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date) => (
          <DayCell
            key={fmt(date)}
            date={date}
            tasks={tasks}
            currentMonth={month}
            onDrop={handleDrop}
            onTaskClick={onTaskClick}
            dragging={dragging}
            setDragging={setDragging}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-slate-500">
        {[
          { label: 'High', cls: 'bg-rose-400' },
          { label: 'Medium', cls: 'bg-amber-400' },
          { label: 'Low', cls: 'bg-emerald-400' },
          { label: 'Today', cls: 'bg-indigo-500' },
        ].map(({ label, cls }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${cls}`} /> {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <GripVertical className="w-3 h-3" /> Drag to reschedule
        </span>
      </div>
    </div>
  );
}
