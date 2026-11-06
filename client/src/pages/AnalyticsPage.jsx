import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  BarChart2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchAnalyticsSummaryApi } from '../services/api';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetchAnalyticsSummaryApi().catch(() => ({}));
        if (res.summary) {
          setData(res.summary);
        }
      } catch (err) {
        console.warn('Analytics loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const summary = data || {
    streak: 0,
    hoursLoggedToday: 0,
    dailyHours: 2,
    completionRate: 0,
    totalTasks: 0,
    completedTasks: 0,
    hoursPerSubject: [],
    minutesPerDayLast7Days: [],
    syllabusCompletion: [],
  };

  const chart7DaysData = (summary.minutesPerDayLast7Days || []).map((d) => ({
    day: d.day,
    hours: d.hours,
    minutes: d.minutes,
  }));

  const pieData = (summary.hoursPerSubject || [])
    .filter((s) => s.minutes > 0)
    .map((s) => ({
      name: s.subjectName,
      value: s.hours,
      color: s.color || '#6366f1',
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Study Analytics & Insights</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics, consistency streak, and syllabus completion derived from your study logs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Consistency Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <span>{summary.streak}</span>
            <span className="text-xs font-semibold text-slate-400">
              {summary.streak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
            {summary.streak > 0 ? 'Active study streak!' : 'Complete tasks or study sessions to build streak'}
          </p>
        </div>

        {/* Study Time Today */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Time Logged Today</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <span>{summary.hoursLoggedToday}</span>
            <span className="text-xs font-semibold text-slate-400">/ {summary.dailyHours} hrs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Goal: {summary.dailyHours} hours/day
          </p>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2">
            {summary.completionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.completedTasks} of {summary.totalTasks} tasks completed
          </p>
        </div>

        {/* Next Exam */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Next Exam Target</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-300 mt-2 truncate">
            {summary.nextExam ? `${summary.nextExam.daysLeft} Days` : '--'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {summary.nextExam ? summary.nextExam.name : 'No upcoming exams'}
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days Activity Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Daily Study Hours (Last 7 Days)</h2>
            </div>
            <span className="text-[11px] text-slate-400">Target: {summary.dailyHours}h/day</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart7DaysData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  formatter={(val) => [`${val} hrs`, 'Study Time']}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hours by Subject Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Study Hours by Subject</h2>
            </div>
            <span className="text-[11px] text-slate-400">From Pomodoro Sessions</span>
          </div>

          {pieData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No study sessions logged yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Use the Pomodoro timer to log focus blocks and see subject time distribution.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                    formatter={(val) => [`${val} hrs`, 'Logged']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Syllabus Completion Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Syllabus Completion Progress</h2>
          </div>
          <span className="text-[11px] text-slate-400">Derived from Topic Status</span>
        </div>

        {summary.syllabusCompletion.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
            <p className="text-slate-300 font-semibold mb-1">No subjects or topics found.</p>
            <p>Add subjects and topics in the Subjects module to track syllabus completion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.syllabusCompletion.map((sub) => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub.color || '#6366f1' }}
                    />
                    <span className="font-semibold text-white">{sub.subjectName}</span>
                  </div>
                  <span className="font-bold text-indigo-300">{sub.percentage}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${sub.percentage}%`,
                      backgroundColor: sub.color || '#6366f1',
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>
                    {sub.completedTopics} of {sub.totalTopics} topics completed
                  </span>
                  <span>{sub.totalTopics - sub.completedTopics} remaining</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
