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
  Flame,
  LogIn,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Sidebar({ mobileOpen, onClose }) {
  const { openChatWithPrompt } = useStore();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Overview',
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      to: '/chat',
      label: 'AI Study Tutor',
      icon: Bot,
      badge: 'Member 1',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold',
      highlight: true,
    },
    {
      to: '/flashcards',
      label: 'Flashcards & Quiz',
      icon: BrainCircuit,
      badge: 'Member 1',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold',
      highlight: true,
    },
    {
      to: '/planner',
      label: 'Smart Planner',
      icon: CalendarDays,
      badge: 'Member C',
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      to: '/subjects',
      label: 'Subjects & Topics',
      icon: BookOpen,
      badge: 'Member C',
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      to: '/timer',
      label: 'Pomodoro Timer',
      icon: Timer,
      badge: 'Member D',
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      to: '/analytics',
      label: 'Analytics & Streaks',
      icon: BarChart3,
      badge: 'Member D',
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      to: '/settings',
      label: 'Settings & Profile',
      icon: Settings,
    },
    {
      to: '/login',
      label: 'Login / Sign Up',
      icon: LogIn,
      badge: 'Auth',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-900/95 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-4">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-5 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">StudyBuddy</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              v1.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Study Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/25 to-purple-600/15 text-indigo-200 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="my-auto" />

          {/* Exam Countdown Widget */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/50 border border-indigo-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                Target Exam
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                In 5 Days
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">CS301: Data Structures</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Trees, Graphs, & DP</p>

            {/* Micro Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 my-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full w-[65%]" />
            </div>

            <button
              onClick={() => {
                onClose && onClose();
                openChatWithPrompt('Explain AVL Tree rotations with a simple analogy, and quiz me!');
              }}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Review with AI Tutor</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Member 1 Lead Badge footer */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Logged in: Monika S.</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
