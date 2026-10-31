import React, { useState } from 'react';
import { User, Clock, Shield, Database, Cpu, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function SettingsPage() {
  const { user } = useStore();
  const [dailyHours, setDailyHours] = useState(user.dailyHours);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">Settings & Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your student study preferences and project roles.</p>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Study settings saved successfully!</span>
        </div>
      )}

      {/* Profile Info */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Student Account Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user.name}
              className="w-full bg-slate-950 text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Project Role</label>
            <input
              type="text"
              readOnly
              value="Member 1 — Team Lead + AI Chatbot & Quiz"
              className="w-full bg-slate-950 text-indigo-300 font-semibold px-3.5 py-2.5 rounded-xl border border-indigo-500/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1">Email</label>
            <input
              type="email"
              readOnly
              value={user.email}
              className="w-full bg-slate-950 text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Study Preferences */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Study Preferences</span>
        </h2>

        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-medium">
            Daily Available Study Limit: <strong className="text-indigo-400">{dailyHours} hours/day</strong>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            The Auto-Scheduler algorithm (Member B) fills up to this daily limit without overloading you.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
        >
          Save Preferences
        </button>
      </form>

      {/* System Status Footprint */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3 text-xs">
        <h3 className="font-bold text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>System Environment Status</span>
        </h3>
        <div className="space-y-1.5 text-slate-400 text-[11px]">
          <p>&bull; Express Backend: <span className="text-emerald-400">Running on http://localhost:5001</span></p>
          <p>&bull; Chatbot Engine: <span className="text-emerald-400">Context Builder + 4 Tools Active</span></p>
          <p>&bull; Flashcards & Quiz Engine: <span className="text-emerald-400">Weak-Topic Detection Active</span></p>
          <p>&bull; App Shell & Router: <span className="text-emerald-400">Responsive Sidebar + Navbar + Global Floating Chat</span></p>
        </div>
      </div>
    </div>
  );
}
