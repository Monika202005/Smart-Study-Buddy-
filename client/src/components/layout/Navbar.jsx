import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Flame, Clock, Bot, Bell, Menu, LogOut, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Navbar({ onMobileMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout, toggleFloatingChat, subjects, tasks } = useStore();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const streak = user?.streak ?? 0;
  const dailyHours = user?.dailyHours ?? 2;
  const userName = user?.name || 'Student';
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SB';

  // Compute live notifications from real user data
  const overdueCount = (tasks || []).filter(
    (t) => !t.completed && t.scheduledDate && t.scheduledDate < new Date().toISOString().split('T')[0]
  ).length;

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile menu button + Brand title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/app/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                StudyBuddy
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Workspace
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Smart Planner & Adaptive Tutor</p>
          </div>
        </Link>
      </div>

      {/* Center / Right: Student Badges & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold shadow-inner"
          title={`Daily Study Streak: ${streak} days in a row!`}
        >
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{streak}d Streak</span>
        </div>

        {/* Daily Goal Pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
          title={`Target Daily Study Hours: ${dailyHours} hours`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dailyHours}h Daily Goal</span>
        </div>

        {/* AI Tutor Quick Access Button */}
        <button
          onClick={() => toggleFloatingChat(true)}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Bot className="w-4 h-4 text-indigo-100" />
          <span className="hidden sm:inline">Ask AI Tutor</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {overdueCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200">Study Notifications</span>
                <span className="text-[10px] text-indigo-400">
                  {overdueCount > 0 ? `${overdueCount} Overdue` : 'All caught up'}
                </span>
              </div>
              <div className="space-y-2.5">
                {overdueCount > 0 ? (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <p className="font-medium">⚠️ {overdueCount} Overdue Task(s)</p>
                    <p className="text-[11px] text-rose-200/80 mt-0.5">
                      You have tasks requiring attention. Ask the AI tutor to reschedule them!
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-slate-300">
                    <p className="font-medium text-emerald-400">✅ Everything is on track</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No overdue tasks. Keep up the great study momentum!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-80 transition-opacity cursor-pointer"
            title="Account Menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/30">
              {userInitials}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{userName}</p>
              <p className="text-[10px] text-indigo-400 font-medium leading-tight">Student</p>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 text-xs animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1.5">
                <p className="font-bold text-white text-xs">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>

              <Link
                to="/app/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Settings & Profile</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
