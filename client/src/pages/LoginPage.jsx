import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, token, isAuthLoading, authError } = useStore();

  const isSignupRoute = location.pathname === '/signup';
  const [mode, setMode] = useState(isSignupRoute ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dailyHours, setDailyHours] = useState(2);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    setMode(location.pathname === '/signup' ? 'signup' : 'login');
    setLocalError(null);
  }, [location.pathname]);

  // If already logged in, redirect to workspace
  if (isAuthenticated && token) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(cleanEmail, password);
      } else {
        if (!name.trim()) {
          setLocalError('Please enter your full name.');
          return;
        }
        await register(name.trim(), cleanEmail, password, Number(dailyHours));
      }
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify your details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient glowing spheres */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-600/30 text-white mb-2 hover:scale-105 transition-transform">
            <Sparkles className="w-7 h-7 text-indigo-100" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            StudyBuddy
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Welcome back! Sign in to continue your personalized study plan.'
              : 'Create your private account to start tracking subjects and AI study schedules.'}
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-950/80 p-1 border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
                navigate('/login');
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setLocalError(null);
                navigate('/signup');
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{localError || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950/80 text-slate-200 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-slate-950/80 text-slate-200 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[11px] text-slate-500">
                  {mode === 'signup' ? 'Min. 8 characters' : ''}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 text-slate-200 text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 border border-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <span>Daily Study Target:</span>
                  <span className="text-indigo-400 font-bold">{dailyHours} hours/day</span>
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
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to StudyBuddy' : 'Create Student Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Prompt */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setLocalError(null);
                    navigate('/signup');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  Sign up now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError(null);
                    navigate('/login');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-indigo-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
