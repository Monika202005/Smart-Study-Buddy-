import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  BrainCircuit,
  CalendarDays,
  BookOpen,
  Timer,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateCalendarDaysLeft, formatDaysLeftLabel } from '../../utils/dateUtils';

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, subjects, openChatWithPrompt } = useStore();

  const sortedSubjects = [...(subjects || [])]
    .filter((s) => s.examDate)
    .map((s) => ({
      ...s,
      daysLeft: calculateCalendarDaysLeft(s.examDate),
    }))
    .filter((s) => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nearestExam = sortedSubjects[0];
  const targetDaysLabel = nearestExam ? formatDaysLeftLabel(nearestExam.daysLeft) : '--';
  const targetExamTitle = nearestExam ? nearestExam.name : 'No upcoming exams';
  const targetExamSubtext = nearestExam?.topics?.[0]?.name || (nearestExam ? 'Preparing syllabus' : 'Add subjects to track deadlines');

  const navItems = [
    {
      to: '/app/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/app/chat',
      label: 'AI Study Tutor',
      icon: Bot,
      highlight: true,
    },
    {
      to: '/app/flashcards',
      label: 'Flashcards & Quiz',
      icon: BrainCircuit,
      highlight: true,
    },
    {
      to: '/app/planner',
      label: 'Smart Planner',
      icon: CalendarDays,
    },
    {
      to: '/app/subjects',
      label: 'Subjects & Topics',
      icon: BookOpen,
    },
    {
      to: '/app/timer',
      label: 'Pomodoro Timer',
      icon: Timer,
    },
    {
      to: '/app/analytics',
      label: 'Analytics & Streaks',
      icon: BarChart3,
    },
    {
      to: '/app/settings',
      label: 'Settings & Profile',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Nav items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Logo brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">StudyBuddy</span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">Workspace</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Study Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom: Exam countdown widget & user status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Target Exam</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {targetDaysLabel}
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">{targetExamTitle}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{targetExamSubtext}</p>

            <button
              onClick={() => {
                if (onClose) onClose();
                openChatWithPrompt(
                  nearestExam
                    ? `Review key exam preparation concepts for ${nearestExam.name}`
                    : 'Help me plan my study schedule and add subjects!'
                );
              }}
              className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Review with AI Tutor</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* User Status footer */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate max-w-[130px] font-medium text-slate-300">{user?.name || 'Student'}</span>
            <span className="text-emerald-400 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
