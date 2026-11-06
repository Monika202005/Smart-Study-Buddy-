import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bot,
  BrainCircuit,
  PlusCircle,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  fetchTasksApi,
  fetchSubjectsApi,
  toggleTaskCompleteApi,
  fetchAnalyticsSummaryApi,
} from '../services/api';
import { calculateCalendarDaysLeft, formatDaysLeftLabel } from '../utils/dateUtils';

export default function DashboardPage() {
  const { user, openChatWithPrompt } = useStore();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [taskData, subjectData, analyticsData] = await Promise.all([
          fetchTasksApi().catch(() => ({ tasks: [] })),
          fetchSubjectsApi().catch(() => ({ subjects: [] })),
          fetchAnalyticsSummaryApi().catch(() => ({ summary: null })),
        ]);
        setTasks(taskData.tasks || []);
        setSubjects(subjectData.subjects || []);
        if (analyticsData && analyticsData.summary) {
          setAnalytics(analyticsData.summary);
        }
      } catch (e) {
        console.warn('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
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

  const upcomingSorted = [...subjects]
    .filter((s) => s.examDate)
    .map((s) => ({
      ...s,
      daysLeft: calculateCalendarDaysLeft(s.examDate),
    }))
    .filter((s) => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nearestExam = upcomingSorted[0];
  const targetDaysLabel = nearestExam ? formatDaysLeftLabel(nearestExam.daysLeft) : '--';
  const targetExamTitle = nearestExam ? nearestExam.name : 'No exams scheduled';

  const streakDays = analytics?.streak ?? user?.streak ?? 0;
  const targetHours = analytics?.dailyHours ?? user?.dailyHours ?? 2;
  const hoursLoggedToday = analytics?.hoursLoggedToday ?? 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Compact Hero Card - shortened so Today's Study Plan is immediately visible */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/20 px-6 py-5 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                {user?.name || 'Student'}
              </span>
              !
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {nearestExam ? (
                <>
                  Next exam:{' '}
                  <strong className="text-indigo-300 font-semibold">{nearestExam.name}</strong> ({targetDaysLabel}).{' '}
                </>
              ) : (
                'Set up your subjects and exam dates to activate smart deadlines. '
              )}
              You have <strong className="text-white">{todayTasks.length} tasks</strong> scheduled for today.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() =>
                openChatWithPrompt(
                  nearestExam
                    ? `What should I focus on today for ${nearestExam.name}?`
                    : 'Help me plan my study schedule today!'
                )
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-100" />
              <span>Ask AI Tutor</span>
            </button>
            <Link
              to="/app/flashcards"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>Flashcards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding Empty State for Brand New Users */}
      {subjects.length === 0 && !loading && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Start by adding your first subject</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Add course topics and your upcoming exam date to generate an adaptive AI study plan.
              </p>
            </div>
          </div>
          <Link
            to="/app/subjects"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all shadow-md shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add First Subject</span>
          </Link>
        </div>
      )}

      {/* Quick Metrics Bar - Purely from Real User Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</div>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
            {streakDays > 0 ? `${streakDays} consecutive active days` : 'Log study time to start streak'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hours Target</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{targetHours.toFixed(1)} hrs</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{hoursLoggedToday} hrs logged today</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {completedToday} / {todayTasks.length}
          </div>
          <p className="text-[10px] text-indigo-300 mt-0.5">
            {todayTasks.length > 0
              ? `${Math.round((completedToday / todayTasks.length) * 100)}% complete`
              : 'All caught up'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Target Exam</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-1">{targetDaysLabel}</div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{targetExamTitle}</p>
        </div>
      </div>

      {/* Main Grid: Today's Tasks + Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Today's Study Tasks */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Today's Study Plan</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {todayTasks.length} {todayTasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Mark complete or ask the chatbot to adjust</p>
            </div>

            <Link
              to="/app/planner"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Task List */}
          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">No tasks scheduled for today.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Generate an auto-schedule or create a task from the Smart Planner.
                </p>
                <Link
                  to="/app/planner"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>Open Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              todayTasks.map((t) => (
                <div
                  key={t.id || t._id}
                  onClick={() => handleToggleTask(t.id || t._id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    t.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-700 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        t.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          t.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {t.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t.subjectName || 'General'} &bull; {t.durationHours || 2}h estimated
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : t.priority === 'low'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {(t.priority || 'medium').toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Upcoming Exam Deadlines */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Upcoming Exams</h2>
            <Link to="/app/subjects" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Syllabus →
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingSorted.length === 0 ? (
              <div className="text-center py-6 px-3 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                <Calendar className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                <p>No exams scheduled yet.</p>
                <Link
                  to="/app/subjects"
                  className="inline-block mt-2 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add subject & exam date
                </Link>
              </div>
            ) : (
              upcomingSorted.slice(0, 4).map((sub, idx) => (
                <div
                  key={sub.id || sub._id || idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{sub.name}</p>
                    <p className="text-[10px] text-slate-400">Exam: {sub.examDate?.split('T')[0] || ''}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold shrink-0">
                    {formatDaysLeftLabel(sub.daysLeft)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick AI Quiz Launcher Card */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-2 mt-4">
            <p className="font-semibold text-purple-200 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <span>Active Recall Challenge</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Answer 3 quick quiz questions on your topics to solidify your memory retention!
            </p>
            <Link
              to="/app/flashcards"
              className="w-full inline-flex items-center justify-center py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              Start 3-Minute Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
