import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, CheckCircle, Bot } from 'lucide-react';
import TeammateModuleStub from '../components/layout/TeammateModuleStub';
import { useStore } from '../store/useStore';

export default function TimerPage() {
  const { openChatWithPrompt } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert(mode === 'focus' ? '🎉 Focus session complete! Take a 5-minute break.' : 'Break over! Ready for the next study block?');
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = (newMode = mode) => {
    setIsRunning(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    setMode(newMode);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <TeammateModuleStub
      title="Pomodoro Focus Timer"
      memberLetter="D"
      memberRole="Dashboard + Analytics"
      description="Timed study sessions linked to tasks, automatic break management, and study session logging to the database."
      apisPlanned={[
        'POST /api/sessions (log duration and taskId)',
        'GET /api/sessions?range=week',
      ]}
    >
      <div className="flex flex-col items-center max-w-md mx-auto space-y-6 py-6 text-center">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => resetTimer('focus')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              mode === 'focus' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            25m Focus Block
          </button>
          <button
            onClick={() => resetTimer('break')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              mode === 'break' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            5m Short Break
          </button>
        </div>

        {/* Circular Display */}
        <div className="relative w-64 h-64 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950/60 shadow-2xl">
          <div className="text-5xl font-mono font-extrabold text-white tracking-wider">
            {timeFormatted}
          </div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mt-2">
            {mode === 'focus' ? 'Deep Work Session' : 'Resting'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 max-w-xs">
          Completed sessions automatically feed into Member D's Analytics charts and streak tracking!
        </p>
      </div>
    </TeammateModuleStub>
  );
}
