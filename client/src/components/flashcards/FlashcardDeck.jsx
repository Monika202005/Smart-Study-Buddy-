import React, { useState } from 'react';
import { RotateCw, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Sparkles, BookOpen, Brain } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function FlashcardDeck({ cards = [] }) {
  const { recordCardResult, openChatWithPrompt } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
        <Brain className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Flashcards in this Category</h3>
        <p className="text-xs text-slate-500 mt-1">
          Click "Generate New Cards" to create cards on any subject!
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleGrade = (result) => {
    recordCardResult(currentCard._id, result);
    handleNext();
  };

  const difficultyLabels = {
    1: { label: 'Easy', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
    2: { label: 'Medium', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
    3: { label: 'Hard', color: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between w-full text-xs text-slate-400 px-2">
        <span className="font-semibold text-slate-300">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${difficultyLabels[currentCard.difficulty]?.color}`}>
            {difficultyLabels[currentCard.difficulty]?.label}
          </span>
          {currentCard.lastResult === 'incorrect' && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
              Needs Review
            </span>
          )}
          {currentCard.lastResult === 'correct' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Mastered
            </span>
          )}
        </div>
      </div>

      {/* 3D Flip Flashcard Container */}
      <div
        className="relative w-full h-[320px] sm:h-[340px] cursor-pointer [perspective:1000px] select-none group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-2xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-700/80 [backface-visibility:hidden] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-400 mb-4">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {currentCard.subjectName}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentCard.topicName}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed mt-2">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-indigo-300 group-hover:text-indigo-200">
                <RotateCw className="w-4 h-4 animate-spin-slow" />
                Click card or tap to flip answer
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Question</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 border border-purple-500/40 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between">
            <div className="overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-purple-300 mb-2">
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Correct Answer
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openChatWithPrompt(`Explain why "${currentCard.answer}" is the answer for: "${currentCard.question}"`);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Ask Tutor →
                </button>
              </div>

              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentCard.answer}
              </p>

              {currentCard.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-purple-400 font-semibold">Why: </span>
                  {currentCard.explanation}
                </div>
              )}
            </div>

            {/* Grading Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleGrade('incorrect')}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Need Review</span>
              </button>

              <button
                onClick={() => handleGrade('correct')}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Knew It (Mastered)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full px-4">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-all"
        >
          <span>Next Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
