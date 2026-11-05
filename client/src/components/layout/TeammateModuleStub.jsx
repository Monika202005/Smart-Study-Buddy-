import React from 'react';
import { Bot } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function TeammateModuleStub({
  title,
  description,
  children,
}) {
  const { openChatWithPrompt } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{description}</p>
          </div>

          <button
            onClick={() => openChatWithPrompt(`How does ${title} integrate with my study plan and upcoming exams?`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all shrink-0 hover:scale-105"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Tutor about this</span>
          </button>
        </div>
      </div>

      {/* Module Content */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
        {children}
      </div>
    </div>
  );
}
