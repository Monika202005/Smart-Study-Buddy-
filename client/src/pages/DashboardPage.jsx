import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bot,
  Layers,
  BookOpen,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fetchTasksApi, fetchSubjectsApi, toggleTaskCompleteApi } from '../services/api';

export default function DashboardPage() {
  const { user, openChatWithPrompt } = useStore();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [taskData, subjectData] = await Promise.all([
          fetchTasksApi().catch(() => ({ tasks: [] })),
          fetchSubjectsApi().catch(() => ({ subjects: [] })),
        ]);
        setTasks(taskData.tasks || []);
        setSubjects(subjectData.subjects || []);
      } catch (e) {
        console.warn('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      const res = await toggleTaskCompleteApi(taskId);
      if (res.success && res.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: res.task.completed } : t))
        );
      }
    } catch (e) {
      console.warn('Toggle failed:', e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome Card with AI Illustration */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Stack Development Project &bull; Team of 4</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{user.name}</span>!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Your next major exam is <strong className="text-indigo-300">CS301 (Data Structures) in 5 days</strong>. You have <strong>{todayTasks.length} study tasks</strong> planned for today.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
              <button
                onClick={() => openChatWithPrompt('What should I study today based on my upcoming exams?')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Bot className="w-4 h-4 text-indigo-100" />
                <span>Ask AI Tutor for Daily Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <Link
                to="/flashcards"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Review Flashcards</span>
              </Link>
            </div>
          </div>

          {/* 3D Generated Hero Image */}
          <div className="relative shrink-0 w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 group">
            <img
              src="/study_hero.jpg"
              alt="StudyBuddy AI Workspace"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[10px] font-semibold text-indigo-200 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-indigo-500/30">
                StudyBuddy AI Companion
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar (Member D Preview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">4 Days</div>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Top 10% consistency</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hours Target</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">4.0 hrs</div>
          <p className="text-[10px] text-slate-400 mt-0.5">2.5 hrs logged today</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{completedToday} / {todayTasks.length}</div>
          <p className="text-[10px] text-indigo-300 mt-0.5">{todayTasks.length > 0 ? `${Math.round((completedToday / todayTasks.length) * 100)}% complete` : 'All done'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Target Exam</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-1">5 Days</div>
          <p className="text-[10px] text-slate-400 mt-0.5">CS301: Data Structures</p>
        </div>
      </div>

      {/* Main Grid: Today's Tasks + Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Study Tasks */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Today's Study Plan</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {todayTasks.length} Tasks
                </span>
              </h2>
              <p className="text-xs text-slate-400">Mark complete or ask the chatbot to adjust</p>
            </div>

            <Link
              to="/planner"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Task List */}
          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No tasks scheduled for today.</p>
            ) : (
              todayTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    t.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-700 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        t.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t.subjectName} &bull; {t.durationHours}h estimated
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {t.priority?.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Upcoming Exam Deadlines */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Upcoming Exams</h2>
            <Link to="/subjects" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Syllabus →
            </Link>
          </div>

          <div className="space-y-3">
            {subjects.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{sub.name}</p>
                  <p className="text-[10px] text-slate-400">Exam: {sub.examDate}</p>
                </div>
                <span className="px-2 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold shrink-0">
                  {idx === 0 ? 'In 5 Days' : idx === 1 ? 'In 12 Days' : 'In 19 Days'}
                </span>
              </div>
            ))}
          </div>

          {/* Quick AI Quiz Launcher Card */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-2">
            <p className="font-semibold text-purple-200 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <span>Active Recall Challenge</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Spend 3 minutes answering quick quiz questions to solidify your memory retention!
            </p>
            <Link
              to="/flashcards"
              className="w-full inline-flex items-center justify-center py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all"
            >
              Start 3-Minute Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
