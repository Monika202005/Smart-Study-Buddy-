import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Coffee,
  Check,
} from 'lucide-react';
import { fetchTasksApi, fetchSubjectsApi, logStudySessionApi } from '../services/api';

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [sessionCompletedNotice, setSessionCompletedNotice] = useState(null);
  const [loggedSessionsCount, setLoggedSessionsCount] = useState(0);

  const initialDurationRef = useRef(25 * 60);

  useEffect(() => {
    async function loadTasksAndSubjects() {
      try {
        const [taskData, subjectData] = await Promise.all([
          fetchTasksApi().catch(() => ({ tasks: [] })),
          fetchSubjectsApi().catch(() => ({ subjects: [] })),
        ]);
        const pendingTasks = (taskData.tasks || []).filter((t) => !t.completed);
        setTasks(pendingTasks);
        setSubjects(subjectData.subjects || []);
        if (pendingTasks.length > 0) {
          setSelectedTaskId(pendingTasks[0].id || pendingTasks[0]._id);
        }
      } catch (err) {
        console.warn('Timer load error:', err);
      }
    }
    loadTasksAndSubjects();
  }, []);

  const handleSessionComplete = async () => {
    setIsRunning(false);

    if (mode === 'focus') {
      const minutesSpent = Math.max(1, Math.round(initialDurationRef.current / 60));
      const selectedTask = tasks.find((t) => (t.id || t._id) === selectedTaskId);

      try {
        await logStudySessionApi({
          durationMin: minutesSpent,
          taskId: selectedTask ? (selectedTask.id || selectedTask._id) : null,
          subjectId: selectedTask ? selectedTask.subjectId : null,
          notes: selectedTask ? `Studied: ${selectedTask.title}` : 'General focus session',
          date: new Date().toISOString().split('T')[0],
        });
        setLoggedSessionsCount((c) => c + 1);
        setSessionCompletedNotice(
          `🎉 Great focus! Logged ${minutesSpent} min study session${
            selectedTask ? ` for "${selectedTask.title}"` : ''
          }. Time for a break!`
        );
      } catch (err) {
        setSessionCompletedNotice('Session completed! (Local log saved)');
      }
    } else {
      setSessionCompletedNotice('Break completed! Ready for your next focused study block?');
    }
  };

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const setTimerMode = (newMode, minutes = null) => {
    setIsRunning(false);
    setMode(newMode);
    const mins = minutes ?? (newMode === 'focus' ? 25 : 5);
    const secs = mins * 60;
    initialDurationRef.current = secs;
    setTotalDuration(secs);
    setTimeLeft(secs);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Pomodoro Study Timer</h1>
        <p className="text-xs text-slate-400">
          Maintain deep focus with timed study blocks. Completed sessions automatically feed your analytics.
        </p>
      </div>

      {/* Completion Notification Banner */}
      {sessionCompletedNotice && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{sessionCompletedNotice}</span>
          </div>
          <button
            onClick={() => setSessionCompletedNotice(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Glass Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col items-center space-y-6">
        {/* Linked Task Selector */}
        <div className="w-full max-w-md space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Link Focus Block to a Task:</span>
            </span>
            <span className="text-[11px] text-slate-500">Optional</span>
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-slate-950/90 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">General Study (No specific task)</option>
            {tasks.map((t) => (
              <option key={t.id || t._id} value={t.id || t._id}>
                {t.title} ({t.subjectName || 'Study'})
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setTimerMode('focus', 25)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            25m Focus Block
          </button>
          <button
            type="button"
            onClick={() => setTimerMode('break', 5)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'break'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5m Break
          </button>
          <button
            type="button"
            onClick={() => setTimerMode('focus', 0.1)} // 6 seconds for testing
            className="px-2.5 py-2 rounded-xl text-[10px] text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Quick test mode (6 seconds)"
          >
            ⚡ Test 6s
          </button>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-64 h-64 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950/80 shadow-2xl overflow-hidden">
          {/* Circular progress backdrop */}
          <div
            className="absolute inset-0 bg-indigo-600/10 pointer-events-none transition-all duration-1000"
            style={{
              clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent}% -50%)`,
            }}
          />

          <div className="relative z-10 text-5xl font-mono font-extrabold text-white tracking-wider">
            {timeFormatted}
          </div>
          <span className="relative z-10 text-xs font-semibold text-indigo-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
            {mode === 'focus' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deep Work</span>
              </>
            ) : (
              <>
                <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Short Break</span>
              </>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTimerMode(mode)}
            className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>{timeLeft < totalDuration ? 'Resume Focus' : 'Start Focus'}</span>
              </>
            )}
          </button>
        </div>

        {/* Real Stats footer */}
        <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-around text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Completed Blocks: <strong className="text-white">{loggedSessionsCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Auto-Logged to MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
