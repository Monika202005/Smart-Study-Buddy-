import React, { useState } from 'react';
import { Bot, User, Copy, Check, Calendar, CheckCircle2, RotateCcw, PlusCircle, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Formats basic Markdown text into clean HTML elements safely
 */
function renderMarkdown(content) {
  if (!content) return null;

  // Split content by paragraphs or code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // Code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3).trim().split('\n');
      const firstLine = lines[0].trim();
      const language = firstLine.match(/^[a-zA-Z0-9_-]+$/) ? firstLine : '';
      const code = language ? lines.slice(1).join('\n') : lines.join('\n');

      return (
        <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 font-mono text-xs">
          {language && (
            <div className="bg-slate-800/80 px-3 py-1 text-[11px] text-slate-400 font-semibold border-b border-slate-700/60">
              {language}
            </div>
          )}
          <pre className="p-3 text-slate-200 overflow-x-auto leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Standard markdown rendering line-by-line
    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-1.5">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1.5" />;

          // Headings
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={lIdx} className="text-sm font-bold text-indigo-300 mt-2 mb-1">
                {trimmed.slice(4)}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={lIdx} className="text-base font-bold text-white mt-2 mb-1">
                {trimmed.slice(3)}
              </h2>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const bulletText = trimmed.replace(/^[-•]\s*/, '');
            return (
              <div key={lIdx} className="flex items-start gap-2 text-xs leading-relaxed pl-1 text-slate-200">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>{renderInlineFormatting(bulletText)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2 text-xs leading-relaxed pl-1 text-slate-200">
                <span className="text-indigo-400 font-semibold text-[11px] mt-0.5">{numMatch[1]}.</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Divider
          if (trimmed === '---') {
            return <hr key={lIdx} className="border-slate-800 my-2" />;
          }

          return (
            <p key={lIdx} className="text-xs leading-relaxed text-slate-200">
              {renderInlineFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  });
}

function renderInlineFormatting(text) {
  // Bold **text**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      return (
        <strong key={bIdx} className="font-semibold text-white">
          {bPart.slice(2, -2)}
        </strong>
      );
    }

    // Inline code `code`
    const codeParts = bPart.split(/(`.*?`)/g);
    return codeParts.map((cPart, cIdx) => {
      if (cPart.startsWith('`') && cPart.endsWith('`')) {
        return (
          <code
            key={cIdx}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/50"
          >
            {cPart.slice(1, -1)}
          </code>
        );
      }
      return cPart;
    });
  });
}

export default function ChatMessageItem({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeFormatted = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex gap-3 my-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 text-white mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 relative group text-xs shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
              : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none backdrop-blur-sm'
          }`}
        >
          {/* Message Content */}
          <div className="prose-sm max-w-none">
            {renderMarkdown(message.content)}
          </div>

          {/* Tool Execution Cards (Week 4: get_today_plan, create_task, reschedule_missed, generate_flashcards) */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
              {message.toolCalls.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    {tc.tool === 'get_today_plan' && <Calendar className="w-4 h-4 text-indigo-400" />}
                    {tc.tool === 'reschedule_missed' && <RotateCcw className="w-4 h-4 text-amber-400" />}
                    {tc.tool === 'create_task' && <PlusCircle className="w-4 h-4 text-emerald-400" />}
                    {tc.tool === 'generate_flashcards' && <BrainCircuit className="w-4 h-4 text-purple-400" />}
                    <div>
                      <p className="font-semibold text-slate-200">
                        ⚡ Tool Executed: <code className="text-indigo-300 font-mono text-[11px]">{tc.tool}</code>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {tc.result?.summary || tc.result?.message || 'Action executed and planner synchronized.'}
                      </p>
                    </div>
                  </div>

                  {tc.tool === 'generate_flashcards' && (
                    <Link
                      to="/flashcards"
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold whitespace-nowrap"
                    >
                      View Deck →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Copy Button (on hover) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy answer"
              aria-label="Copy answer to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {timeFormatted && (
          <span className="text-[10px] text-slate-500 mt-1 px-1">
            {timeFormatted}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
