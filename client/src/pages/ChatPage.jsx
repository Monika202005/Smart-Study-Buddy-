import React from 'react';
import { Bot, Sparkles, Shield, Cpu, Terminal } from 'lucide-react';
import ChatInterface from '../components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Title & Ownership Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold">
              ⭐ Member 1 Feature (Team Lead + Chatbot)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Week 1–5 Complete
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Adaptive AI Study Tutor</span>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-context tutor connected to your exam dates, today's tasks, tool actions, and quiz recommendations.
          </p>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            🧠 Planner-Aware
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300">
            ⚡ 4 Tool Actions
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-purple-300">
            🛡️ Guardrails Safe
          </span>
        </div>
      </div>

      {/* Main Full-Page Chatbot Canvas */}
      <div className="h-[calc(100vh-220px)] min-h-[580px]">
        <ChatInterface isFloating={false} />
      </div>
    </div>
  );
}
