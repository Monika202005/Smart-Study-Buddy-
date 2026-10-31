import React, { useEffect } from 'react';
import { AlertTriangle, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function WeakTopicsBanner() {
  const { weakTopics, loadWeakTopics, openChatWithPrompt } = useStore();

  useEffect(() => {
    loadWeakTopics();
  }, []);

  if (!weakTopics || weakTopics.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-emerald-200 font-medium">
            Strong Retention! No weak topics detected in recent quizzes.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400 font-semibold">100% Mastery</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
              <span>Weak Topics Detected from Quiz Results</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {weakTopics.length} Needs Attention
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Algorithm flagged concepts where you missed questions. Review these before exam day!
            </p>
          </div>
        </div>
      </div>

      {/* Weak Topics Chips */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {weakTopics.map((topic, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <p className="font-semibold text-rose-200">
                {topic.topicName}
              </p>
              <p className="text-[10px] text-slate-400">
                {topic.subjectName} &bull; Missed {topic.missedCount}x in quiz
              </p>
            </div>

            <button
              onClick={() =>
                openChatWithPrompt(
                  `I struggled with "${topic.topicName}" (${topic.subjectName}) in my quiz. Can you break it down with an analogy and give me 1 practice question?`
                )
              }
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1.5 shrink-0 transition-all hover:scale-105"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Tutor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
