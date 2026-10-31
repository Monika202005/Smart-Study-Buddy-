import React, { useState } from 'react';
import { CheckCircle, XCircle, Trophy, RotateCcw, Bot, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';

export default function QuizMode({ cards = [] }) {
  const { recordCardResult, openChatWithPrompt } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersLog, setAnswersLog] = useState([]);

  // Filter cards that have multiple choice options
  const quizCards = cards.filter((c) => c.options && c.options.length > 0);

  if (quizCards.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
        <p className="text-sm">No multiple choice quiz questions generated yet.</p>
        <p className="text-xs text-slate-500 mt-1">
          Use the "Generate Questions" button to create an interactive quiz!
        </p>
      </div>
    );
  }

  const currentCard = quizCards[currentIndex];

  const handleSelect = (option) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(option);

    const isCorrect =
      option === currentCard.answer ||
      currentCard.options[0] === option ||
      (currentCard.options.length > 0 && option.toLowerCase().includes(currentCard.answer.toLowerCase()));

    const resultStatus = isCorrect ? 'correct' : 'incorrect';
    recordCardResult(currentCard._id, resultStatus, option);

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setAnswersLog((prev) => [
      ...prev,
      {
        question: currentCard.question,
        selected: option,
        isCorrect,
        explanation: currentCard.explanation,
        topic: currentCard.topicName,
        subject: currentCard.subjectName,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= quizCards.length) {
      setQuizFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  };

  // Completion Screen
  if (quizFinished) {
    const percentage = Math.round((score / quizCards.length) * 100);
    const missedAnswers = answersLog.filter((a) => !a.isCorrect);

    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20 mb-4">
          <Trophy className="w-8 h-8 text-amber-200" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white">Quiz Completed!</h2>
        <p className="text-xs text-slate-400 mt-1">Here is your performance breakdown</p>

        {/* Score Ring / Card */}
        <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            {score} / {quizCards.length}
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-1">
            {percentage}% Score &bull; {percentage >= 75 ? '🎉 Outstanding Retention!' : '📚 Practice needed on missed topics'}
          </p>
        </div>

        {/* Missed Topics Remediation */}
        {missedAnswers.length > 0 && (
          <div className="text-left mb-6 space-y-2.5">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
              Topics to Review ({missedAnswers.length})
            </h4>
            {missedAnswers.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-rose-200">{m.topic}</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{m.question}</p>
                </div>
                <button
                  onClick={() =>
                    openChatWithPrompt(
                      `I got this question wrong in my quiz: "${m.question}". Can you explain why the correct concept works and give an analogy?`
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 shrink-0"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Explain</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleRestart}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-300">
          Question {currentIndex + 1} of {quizCards.length}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
          Score: {score}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-500 h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / quizCards.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            {currentCard.subjectName} &bull; {currentCard.topicName}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-relaxed">
            {currentCard.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentCard.options.map((opt, optIdx) => {
            const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
            const isSelected = selectedOption === opt;
            const isTargetAnswer =
              opt === currentCard.answer ||
              (currentCard.options.length > 0 && optIdx === 1) || // fallback match
              opt.toLowerCase().includes(currentCard.answer.toLowerCase());

            let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800/50';

            if (selectedOption !== null) {
              if (isSelected && isTargetAnswer) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
              } else if (isSelected && !isTargetAnswer) {
                btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
              } else if (isTargetAnswer) {
                btnStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
              } else {
                btnStyle = 'opacity-40 border-slate-800 text-slate-400';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={selectedOption !== null}
                onClick={() => handleSelect(opt)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-medium flex items-center justify-between gap-3 transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <span>{opt}</span>
                </div>

                {selectedOption !== null && isTargetAnswer && (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {selectedOption !== null && isSelected && !isTargetAnswer && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button */}
        {selectedOption !== null && (
          <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
            {currentCard.explanation && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-indigo-400 font-bold">Explanation: </span>
                {currentCard.explanation}
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <span>{currentIndex + 1 >= quizCards.length ? 'View Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
