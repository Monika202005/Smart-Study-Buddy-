import React from 'react';
import { Layers, Bot, CheckCircle, Code2, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function TeammateModuleStub({
  title,
  memberRole,
  memberLetter,
  description,
  apisPlanned = [],
  children,
}) {
  const { openChatWithPrompt } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Lead Integration Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                Module Owner: Member {memberLetter} ({memberRole})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Shell & API Contract Ready
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{description}</p>
          </div>

          <button
            onClick={() => openChatWithPrompt(`How does the ${title} integrate with my study plan and upcoming exams?`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all shrink-0 hover:scale-105"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Tutor about this</span>
          </button>
        </div>

        {/* API Contract Footprint */}
        <div className="mt-4 pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            Live Backend Contract Endpoints:
          </span>
          {apisPlanned.map((api, idx) => (
            <code
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 font-mono text-[11px] border border-slate-800"
            >
              {api}
            </code>
          ))}
        </div>
      </div>

      {/* Interactive Mock Preview / Live Backend Demo Section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
        {children}
      </div>
    </div>
  );
}
