import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, AlertCircle, RefreshCw, Sparkles, Shield, Compass } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ChatMessageItem from './ChatMessageItem';
import PromptSuggestions from './PromptSuggestions';

export default function ChatInterface({ isFloating = false }) {
  const {
    chatMessages,
    isChatLoading,
    chatError,
    loadChatHistory,
    sendUserMessage,
    clearChat,
  } = useStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatMessages.length === 0) {
      loadChatHistory();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const query = input;
    setInput('');
    sendUserMessage(query);
  };

  const handlePromptSelect = (promptText) => {
    sendUserMessage(promptText);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900/60 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden ${isFloating ? 'max-h-[600px]' : 'min-h-[75vh]'}`}>
      {/* Top Header */}
      <div className="px-4 py-3 sm:px-6 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">StudyBuddy AI Tutor</h2>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Context Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Knows your syllabus, exams, and today's schedule
            </p>
          </div>
        </div>

        {/* Clear chat action */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1"
            title="Reset conversation"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Planner Context Bar (Informs student of live schedule injection) */}
      <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-indigo-300 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            <strong>Context Injected:</strong> CS301 Exam in 5 days &bull; 2 tasks today &bull; 1 overdue
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <Shield className="w-3 h-3 text-indigo-400" />
          <span>Guardrails & Rate Limit Safe</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
        {chatMessages.map((msg, idx) => (
          <ChatMessageItem key={msg._id || idx} message={msg} />
        ))}

        {/* Loading Indicator */}
        {isChatLoading && (
          <div className="flex items-center gap-3 my-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              </div>
              <span className="text-[11px] text-slate-400">StudyBuddy is thinking and checking your planner...</span>
            </div>
          </div>
        )}

        {/* Error Banner with Retry */}
        {chatError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{chatError}</span>
            </div>
            <button
              onClick={() => sendUserMessage('What should I study today?')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-[11px] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar: Suggestions + Input Form */}
      <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/90 space-y-3">
        {/* Suggestion Chips */}
        <PromptSuggestions onSelectPrompt={handlePromptSelect} />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            placeholder="Ask doubts, reschedule tasks, or type 'What should I study today?'..."
            className="w-full bg-slate-950/80 text-slate-100 text-xs sm:text-sm rounded-2xl pl-4 pr-24 py-3 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-500 shadow-inner"
            disabled={isChatLoading}
            id="chat-user-input"
          />

          <div className="absolute right-2 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              {input.length}/2000
            </span>
            <button
              type="submit"
              disabled={!input.trim() || isChatLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-purple-600 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              aria-label="Send Message"
              id="chat-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
