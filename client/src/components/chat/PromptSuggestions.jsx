import React from 'react';
import { Sparkles, Calendar, RotateCcw, Brain, Layers, Database } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Calendar,
    label: "What should I study today?",
    prompt: "What should I study today based on my upcoming exams?",
    color: "from-blue-500/20 to-indigo-500/20 border-indigo-500/30 text-indigo-200",
  },
  {
    icon: RotateCcw,
    label: "Reschedule missed tasks",
    prompt: "I fell behind yesterday, please reschedule my missed tasks.",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-200",
  },
  {
    icon: Brain,
    label: "Explain AVL Trees",
    prompt: "Explain AVL Tree rotations using a simple analogy and quiz me on it.",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-200",
  },
  {
    icon: Layers,
    label: "Stack vs Queue",
    prompt: "Explain the difference between a Stack and a Queue in simple terms.",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-200",
  },
  {
    icon: Database,
    label: "B+ Tree Indexing",
    prompt: "How does B+ Tree indexing work in databases and why is it preferred over B Trees?",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-200",
  },
];

export default function PromptSuggestions({ onSelectPrompt }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Quick Study Questions & Tool Actions:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(s.prompt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-gradient-to-r text-xs font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-sm ${s.color}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
