import React, { useState, useEffect } from 'react';
import { User, Clock, CheckCircle, AlertCircle, Loader2, Palette } from 'lucide-react';
import { useStore } from '../store/useStore';
import { updateUserProfileApi } from '../services/api';

export default function SettingsPage() {
  const { user, fetchCurrentUser } = useStore();

  const [name, setName] = useState(user?.name || '');
  const [dailyHours, setDailyHours] = useState(user?.dailyHours || 2);
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDailyHours(user.dailyHours || 2);
      setTheme(user.theme || 'dark');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await updateUserProfileApi({
        name: name.trim(),
        dailyHours: Number(dailyHours),
        theme,
      });

      if (res.success) {
        setSuccessMsg('Profile and study preferences updated successfully!');
        await fetchCurrentUser();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">Settings & Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your personal profile, daily study targets, and interface preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Info */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Student Account Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/80 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Account Role</label>
              <input
                type="text"
                readOnly
                value="Active Student"
                className="w-full bg-slate-950/40 text-indigo-300 font-semibold px-3.5 py-2.5 rounded-xl border border-indigo-500/20 cursor-default"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full bg-slate-950/40 text-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-800 cursor-default"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Email address is permanently bound to your account.
              </span>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Study Capacity & Limits</span>
          </h2>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
              <span>Daily Target Available Hours:</span>
              <strong className="text-indigo-400 text-sm">{dailyHours} hours/day</strong>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              The automated study planner respects this limit when distributing topic study blocks each day.
            </p>
          </div>
        </div>

        {/* Interface Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Appearance Theme</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🌙 Dark Mode (Default)
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ☀️ Light Mode
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </form>
    </div>
  );
}
