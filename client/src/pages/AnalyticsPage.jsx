import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, Flame, Award } from 'lucide-react';
import TeammateModuleStub from '../components/layout/TeammateModuleStub';
import { fetchAnalyticsSummaryApi } from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetchAnalyticsSummaryApi().catch(() => ({}));
      if (res.summary) {
        setData(res.summary);
      }
    }
    load();
  }, []);

  const summary = data || {
    totalStudyHoursThisWeek: 16.5,
    streakDays: 4,
    completionRatePercent: 78,
    hoursBySubject: [
      { subject: 'Data Structures', hours: 7.5 },
      { subject: 'DBMS', hours: 5.0 },
      { subject: 'Operating Systems', hours: 4.0 },
    ],
  };

  return (
    <TeammateModuleStub
      title="Study Analytics & Consistency"
      memberLetter="D"
      memberRole="Dashboard + Analytics"
      description="Visual study time distribution, weekly consistency charts (Recharts), task completion rates, and streak calculation."
      apisPlanned={[
        'GET /api/analytics/summary',
        'GET /api/sessions?range=week',
      ]}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Study Time</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {summary.totalStudyHoursThisWeek} hrs
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18% vs last week
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Task Completion Rate</span>
            <div className="text-3xl font-extrabold text-indigo-300 mt-1">
              {summary.completionRatePercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">14 of 18 tasks completed</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Consistency Streak</span>
            <div className="text-3xl font-extrabold text-amber-300 mt-1 flex items-center gap-1.5">
              <span>{summary.streakDays} Days</span>
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1">Personal best: 7 days</p>
          </div>
        </div>

        {/* Hours per subject breakdown */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Study Hours by Subject</h3>
          <div className="space-y-3">
            {summary.hoursBySubject.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{item.subject}</span>
                  <span className="font-semibold">{item.hours} hrs</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${(item.hours / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeammateModuleStub>
  );
}
