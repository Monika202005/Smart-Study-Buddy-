import React, { useEffect, useRef } from 'react';
import { Bot, X, Maximize2, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ChatInterface from './ChatInterface';

export default function FloatingChatWidget() {
  const { floatingChatOpen, toggleFloatingChat } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const triggerButtonRef = useRef(null);

  // If already on the dedicated /chat page, don't show the duplicate floating modal
  const isOnChatPage = location.pathname === '/chat';

  // Keyboard accessibility: Close on Escape key and return focus to trigger button
  useEffect(() => {
    if (!floatingChatOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleFloatingChat(false);
        setTimeout(() => triggerButtonRef.current?.focus(), 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [floatingChatOpen, toggleFloatingChat]);

  if (isOnChatPage) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!floatingChatOpen && (
          <button
            ref={triggerButtonRef}
            onClick={() => toggleFloatingChat(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-xs shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Open AI Study Tutor Chat"
            id="floating-chat-trigger"
          >
            {/* Glowing ring animation */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-40 blur-sm group-hover:opacity-80 transition duration-300 animate-pulse" />

            <div className="relative flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-100" />
              <span className="tracking-wide">Ask StudyBuddy</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {floatingChatOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="StudyBuddy AI Tutor Floating Assistant"
          className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[440px] max-w-[440px] h-[640px] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/80 border border-indigo-500/30 flex flex-col bg-slate-900/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Modal Header Bar with Expand & Close */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">StudyBuddy AI Tutor</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  toggleFloatingChat(false);
                  navigate('/chat');
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400"
                title="Open Fullscreen Page"
                aria-label="Open Fullscreen Page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  toggleFloatingChat(false);
                  setTimeout(() => triggerButtonRef.current?.focus(), 50);
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400"
                title="Close chat"
                aria-label="Close Floating Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface isFloating={true} />
          </div>
        </div>
      )}
    </>
  );
}
